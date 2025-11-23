import axios from 'axios';

const tranzakt = axios.create({
  baseURL: 'https://api.tranzakt.finance',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.TRANZAKT_SECRET_KEY!,
  },
});

export default tranzakt;
