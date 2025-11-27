import {
  type UserConfig,
  type RuleConfigCondition,
  RuleConfigSeverity,
  type TargetCaseType,
} from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: 'conventional-changelog-conventionalcommits',
  rules: {
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      ['feat', 'fix', 'docs', 'refactor', 'test', 'chore'],
    ],
    'subject-case': [
      RuleConfigSeverity.Error,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ] as [RuleConfigSeverity, RuleConfigCondition, TargetCaseType[]],
    'header-max-length': [RuleConfigSeverity.Error, 'always', 120] as const,
    'body-max-line-length': [RuleConfigSeverity.Error, 'always', 500] as const,
    'type-case': [RuleConfigSeverity.Error, 'always', 'lower-case'] as const,
    'type-empty': [RuleConfigSeverity.Error, 'never'] as const,
    'subject-empty': [RuleConfigSeverity.Error, 'never'] as const,
  },
};

export default config;
