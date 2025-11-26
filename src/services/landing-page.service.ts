import type { ClientSession } from 'mongoose';
import type {
  ILandingPage,
  CreateLandingPageInput,
  UpdateLandingPageInput,
  PatchLandingPageInput,
} from '../interfaces/index.ts';
import { LandingPage } from '../models/LandingPage.ts';
import { AppError } from '../utils/AppError.ts';
import { getSignedGetUrl } from '../utils/s3Client.ts';

export class LandingPageService {
  async getLandingPageByTenant(tenantId: string, session?: ClientSession): Promise<ILandingPage> {
    const landingPage = await LandingPage.findOne({ tenantId }).session(session ?? null);

    if (!landingPage) {
      // Create default landing page if none exists
      return await this.createDefaultLandingPage(tenantId, session);
    }

    // Generate fresh signed URLs for all images
    return await this.generateFreshSignedUrls(landingPage);
  }

  private async generateFreshSignedUrls(landingPage: ILandingPage): Promise<ILandingPage> {
    const BUCKET = process.env.S3_BUCKET!;

    // Check if landingPage is a Mongoose document with toObject method
    const updatedLandingPage = landingPage.toObject
      ? { ...landingPage.toObject() }
      : { ...landingPage };

    // Helper function to convert URL to fresh signed URL
    const convertToFreshUrl = async (imageUrl: string | undefined): Promise<string> => {
      if (!imageUrl) return imageUrl || '';

      // If it's already a clean S3 key (starts with 'tenants/'), use it directly
      if (imageUrl.startsWith('tenants/')) {
        return await getSignedGetUrl(BUCKET, imageUrl, 300);
      }

      // If it's a full URL, extract the S3 key and generate fresh URL
      const s3Key = this.extractS3KeyFromUrl(imageUrl);
      if (s3Key) {
        return await getSignedGetUrl(BUCKET, s3Key, 300);
      }

      // If it's not an S3 URL (e.g., https://example.com), return as-is
      return imageUrl;
    };

    // Generate fresh signed URL for logo
    if (updatedLandingPage.logo) {
      updatedLandingPage.logo = await convertToFreshUrl(updatedLandingPage.logo);
    }

    // Generate fresh signed URLs for section images
    if (updatedLandingPage.sections) {
      // Section 1
      if (updatedLandingPage.sections.section1?.image) {
        updatedLandingPage.sections.section1.image = await convertToFreshUrl(
          updatedLandingPage.sections.section1.image
        );
      }

      // Section 2
      if (updatedLandingPage.sections.section2?.image) {
        updatedLandingPage.sections.section2.image = await convertToFreshUrl(
          updatedLandingPage.sections.section2.image
        );
      }

      // Section 3
      if (updatedLandingPage.sections.section3?.image) {
        updatedLandingPage.sections.section3.image = await convertToFreshUrl(
          updatedLandingPage.sections.section3.image
        );
      }

      // Section 4
      if (updatedLandingPage.sections.section4?.image) {
        updatedLandingPage.sections.section4.image = await convertToFreshUrl(
          updatedLandingPage.sections.section4.image
        );
      }

      // Section 5 - Testimonials
      if (updatedLandingPage.sections.section5?.testimonials) {
        for (const testimonial of updatedLandingPage.sections.section5.testimonials) {
          if (testimonial.image) {
            testimonial.image = await convertToFreshUrl(testimonial.image);
          }
        }
      }
    }

    return updatedLandingPage as ILandingPage;
  }

  private extractS3KeyFromUrl(url: string): string | null {
    // Handle URLs that might be URL-encoded or contain query parameters
    // Examples:
    // https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/image.jpg
    // https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/image.jpg?signature=abc

    try {
      // First, decode the URL if it's encoded
      const decodedUrl = decodeURIComponent(url);

      // Remove query parameters and hash
      const urlWithoutQuery = decodedUrl.split('?')[0].split('#')[0];
      if (!urlWithoutQuery) return null;

      // Extract the path after the domain
      const urlMatch = urlWithoutQuery.match(/https:\/\/[^/]+\/(.+)/);
      if (urlMatch) {
        const fullPath = urlMatch[1];
        // Extract the part after 'tutera/'
        const keyMatch = fullPath.match(/tutera\/(.+)/);
        return keyMatch ? keyMatch[1] : null;
      }

      return null;
    } catch (error) {
      console.warn('Failed to extract S3 key from URL:', url, error);
      return null;
    }
  }

  async createLandingPage(
    tenantId: string,
    data: CreateLandingPageInput,
    session?: ClientSession
  ): Promise<ILandingPage> {
    // Check if landing page already exists for this tenant
    const existingPage = await LandingPage.findOne({ tenantId }).session(session ?? null);
    if (existingPage) {
      throw new AppError('Landing page already exists for this tenant. Use update instead.', 409);
    }

    const landingPageData = this.formatLandingPageData(data);

    const landingPage = new LandingPage({
      tenantId,
      ...landingPageData,
    });

    return await landingPage.save({ session: session ?? null });
  }

  async updateLandingPage(
    tenantId: string,
    data: UpdateLandingPageInput,
    session?: ClientSession
  ): Promise<ILandingPage> {
    const landingPage = await LandingPage.findOne({ tenantId }).session(session ?? null);
    if (!landingPage) {
      throw new AppError('Landing page not found. Create one first.', 404);
    }

    const updateData = this.formatLandingPageData(data);

    Object.assign(landingPage, updateData);

    return await landingPage.save({ session: session ?? null });
  }

  async patchLandingPage(
    tenantId: string,
    data: PatchLandingPageInput,
    session?: ClientSession
  ): Promise<ILandingPage> {
    const landingPage = await LandingPage.findOne({ tenantId }).session(session ?? null);
    if (!landingPage) {
      throw new AppError('Landing page not found', 404);
    }

    // Apply partial updates
    if (data.logo !== undefined) {
      landingPage.logo = data.logo;
    }

    if (data.brandName !== undefined) {
      landingPage.brandName = data.brandName;
    }

    if (data.sections) {
      // Initialize sections if they don't exist
      if (!landingPage.sections) {
        landingPage.sections = {
          section1: { image: '' },
          section2: { description: '', image: '' },
          section3: { description: '', image: '' },
          section4: { title: '', description: '', image: '' },
          section5: { testimonials: [] },
        };
      }

      // Update only provided sections
      if (data.sections.section1) {
        landingPage.sections.section1 = {
          ...landingPage.sections.section1,
          ...data.sections.section1,
        };
      }

      if (data.sections.section2) {
        landingPage.sections.section2 = {
          ...landingPage.sections.section2,
          ...data.sections.section2,
        };
      }

      if (data.sections.section3) {
        landingPage.sections.section3 = {
          ...landingPage.sections.section3,
          ...data.sections.section3,
        };
      }

      if (data.sections.section4) {
        landingPage.sections.section4 = {
          ...landingPage.sections.section4,
          ...data.sections.section4,
        };
      }

      if (data.sections.section5) {
        landingPage.sections.section5 = {
          ...landingPage.sections.section5,
          ...data.sections.section5,
        };
      }
    }

    if (data.socialLinks) {
      // Initialize socialLinks if they don't exist
      if (!landingPage.socialLinks) {
        landingPage.socialLinks = {
          twitter: '',
          linkedin: '',
          youtube: '',
          instagram: '',
        };
      }

      // Update only provided social links
      if (data.socialLinks.twitter !== undefined) {
        landingPage.socialLinks.twitter = data.socialLinks.twitter;
      }

      if (data.socialLinks.linkedin !== undefined) {
        landingPage.socialLinks.linkedin = data.socialLinks.linkedin;
      }

      if (data.socialLinks.youtube !== undefined) {
        landingPage.socialLinks.youtube = data.socialLinks.youtube;
      }

      if (data.socialLinks.instagram !== undefined) {
        landingPage.socialLinks.instagram = data.socialLinks.instagram;
      }
    }

    if (data.isActive !== undefined) {
      landingPage.isActive = data.isActive;
    }

    await landingPage.save({ session: session ?? null });

    // Return landing page with fresh signed URLs
    return await this.generateFreshSignedUrls(landingPage);
  }

  async updateLandingPageWithImage(
    tenantId: string,
    section: string,
    s3Key: string, // Store S3 key instead of full URL
    testimonialIndex?: number,
    session?: ClientSession
  ): Promise<ILandingPage> {
    const landingPage = await LandingPage.findOne({ tenantId }).session(session ?? null);
    if (!landingPage) {
      throw new AppError('Landing page not found', 404);
    }

    // Store S3 key in database (will be converted to signed URL on fetch)
    switch (section) {
      case 'logo':
        landingPage.logo = s3Key;
        break;
      case 'section1':
        if (!landingPage.sections.section1) {
          landingPage.sections.section1 = { image: '' };
        }
        landingPage.sections.section1.image = s3Key;
        break;
      case 'section2':
        if (!landingPage.sections.section2) {
          landingPage.sections.section2 = { description: '', image: '' };
        }
        landingPage.sections.section2.image = s3Key;
        break;
      case 'section3':
        if (!landingPage.sections.section3) {
          landingPage.sections.section3 = { description: '', image: '' };
        }
        landingPage.sections.section3.image = s3Key;
        break;
      case 'section4':
        if (!landingPage.sections.section4) {
          landingPage.sections.section4 = { title: '', description: '', image: '' };
        }
        landingPage.sections.section4.image = s3Key;
        break;
      case 'section5':
        if (!landingPage.sections.section5) {
          landingPage.sections.section5 = { testimonials: [] };
        }
        if (typeof testimonialIndex === 'number' && testimonialIndex >= 0) {
          // Update specific testimonial image
          if (!landingPage.sections.section5.testimonials[testimonialIndex]) {
            landingPage.sections.section5.testimonials[testimonialIndex] = {
              image: '',
              name: '',
              jobTitle: '',
              remark: '',
            };
          }
          landingPage.sections.section5.testimonials[testimonialIndex].image = s3Key;
        } else {
          throw new AppError('Testimonial index is required for section5', 400);
        }
        break;
      default:
        throw new AppError('Invalid section', 400);
    }

    await landingPage.save({ session: session ?? null });

    // Return landing page with fresh signed URLs
    return await this.generateFreshSignedUrls(landingPage);
  }

  async deleteLandingPage(tenantId: string, session?: ClientSession): Promise<void> {
    const landingPage = await LandingPage.findOne({ tenantId }).session(session ?? null);
    if (!landingPage) {
      throw new AppError('Landing page not found', 404);
    }

    await LandingPage.deleteOne({ tenantId }).session(session ?? null);
  }

  async toggleLandingPageStatus(
    tenantId: string,
    isActive: boolean,
    session?: ClientSession
  ): Promise<ILandingPage> {
    const landingPage = await LandingPage.findOne({ tenantId }).session(session ?? null);
    if (!landingPage) {
      throw new AppError('Landing page not found', 404);
    }

    landingPage.isActive = isActive;
    return await landingPage.save({ session: session ?? null });
  }

  private async createDefaultLandingPage(
    tenantId: string,
    session?: ClientSession
  ): Promise<ILandingPage> {
    const defaultLandingPage = new LandingPage({
      tenantId,
      logo: '',
      brandName: '',
      sections: {
        section1: { image: '' },
        section2: { description: '', image: '' },
        section3: { description: '', image: '' },
        section4: { title: '', description: '', image: '' },
        section5: { testimonials: [] },
      },
      socialLinks: {
        twitter: '',
        linkedin: '',
        youtube: '',
        instagram: '',
      },
      isActive: true,
    });

    return await defaultLandingPage.save({ session: session ?? null });
  }

  private formatLandingPageData(
    data: CreateLandingPageInput | UpdateLandingPageInput
  ): Partial<ILandingPage> {
    const formattedData: Partial<ILandingPage> = {};

    if (data.logo !== undefined) {
      formattedData.logo = data.logo;
    }

    if (data.brandName !== undefined) {
      formattedData.brandName = data.brandName;
    }

    if (data.sections) {
      formattedData.sections = {
        section1: { image: '' },
        section2: { description: '', image: '' },
        section3: { description: '', image: '' },
        section4: { title: '', description: '', image: '' },
        section5: { testimonials: [] },
      };

      if (data.sections.section1) {
        formattedData.sections.section1 = {
          ...formattedData.sections.section1,
          ...data.sections.section1,
        };
      }

      if (data.sections.section2) {
        formattedData.sections.section2 = {
          ...formattedData.sections.section2,
          ...data.sections.section2,
        };
      }

      if (data.sections.section3) {
        formattedData.sections.section3 = {
          ...formattedData.sections.section3,
          ...data.sections.section3,
        };
      }

      if (data.sections.section4) {
        formattedData.sections.section4 = {
          ...formattedData.sections.section4,
          ...data.sections.section4,
        };
      }

      if (data.sections.section5) {
        formattedData.sections.section5 = {
          ...formattedData.sections.section5,
          ...data.sections.section5,
        };
      }
    }

    if (data.socialLinks) {
      formattedData.socialLinks = {
        twitter: '',
        linkedin: '',
        youtube: '',
        instagram: '',
      };

      if (data.socialLinks.twitter !== undefined) {
        formattedData.socialLinks.twitter = data.socialLinks.twitter;
      }

      if (data.socialLinks.linkedin !== undefined) {
        formattedData.socialLinks.linkedin = data.socialLinks.linkedin;
      }

      if (data.socialLinks.youtube !== undefined) {
        formattedData.socialLinks.youtube = data.socialLinks.youtube;
      }

      if (data.socialLinks.instagram !== undefined) {
        formattedData.socialLinks.instagram = data.socialLinks.instagram;
      }
    }

    return formattedData;
  }
}

export default new LandingPageService();
