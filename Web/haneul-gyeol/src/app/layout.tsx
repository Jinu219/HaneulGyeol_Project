import "./globals.css";
import { Noto_Serif_KR, Gowun_Batang } from "next/font/google";

const noto = Noto_Serif_KR({ subsets: ["latin"], weight: ["300","400","600","700"] });
const gowun = Gowun_Batang({ subsets: ["latin"], weight: ["400","700"] });

export const metadata = {
  title: "하늘결 - 구름을 읽는 시간",
  description: "구름을 이해하고 분류하는 웹 도감",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={noto.className}>
        {children}
      </body>
    </html>
  );
}
