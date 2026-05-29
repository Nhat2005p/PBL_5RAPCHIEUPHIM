/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}", // Đảm bảo quét sâu vào thư mục pages
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // extend: {
    //   colors: {
    //     // Đặt tên trùng với các class bạn đang dùng trong code
    //     'cinema-gold': '#f3ea28', 
    //     'cinema-red': '#e50914',
    //     'dark-bg': '#0A0A0F',     // Nền đen sâu chuẩn cinematic
    //     'surface-card': '#16161f' // Nền thẻ card
    //   },
    
      // Thêm cấu hình font nếu bạn muốn dùng font chữ chuyên nghiệp hơn
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}