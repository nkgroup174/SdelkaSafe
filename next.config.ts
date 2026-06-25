import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Разрешаем загрузку картинок объявлений с внешних источников при необходимости
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Не валим прод-сборку из-за ESLint-предупреждений
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
