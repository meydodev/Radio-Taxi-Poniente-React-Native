module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'], // o ['module:metro-react-native-babel-preset'] si no usas Expo
      plugins: ['react-native-reanimated/plugin'], // Este debe ir al final
    };
  };
  