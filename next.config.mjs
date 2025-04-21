export default {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.extensions.push('.ts', '.tsx');
    }
    return config;
  },
};
