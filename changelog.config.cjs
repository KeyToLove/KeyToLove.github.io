module.exports = {
  writerOpts: {
    transform: (commit, context) => {
      if (commit.type === 'feat') {
        commit.type = '🌟  Features';
      }

      switch (commit.type) {
        case 'feat':
          commit.type = '✨  Features';
          break;
        case 'refactor':
          commit.type = '♻️  refactor';
          break;
        case 'fix':
          commit.type = '🐛  Fix';
          break;
        case 'docs':
          commit.type = '📝  Docs';
          break;
        case 'pref':
          commit.type = '⚡️  Performance';
          break;
        case 'revert':
          commit.type = '⏪  Revert';
          break;
        case 'chore':
          commit.type = '✏️  Chore';
          break;
        default:
          break;
      }

      return commit;
    },
  },
};
