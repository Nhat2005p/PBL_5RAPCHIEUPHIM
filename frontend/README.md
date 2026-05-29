# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# BƯỚC 1: Di chuyển vào thư mục backend
cd Cinema_PBL5_Project/backend

# BƯỚC 2: Kích hoạt môi trường ảo (hiện chữ .venv ở đầu dòng là thành công)
# Dành cho Windows:
..\..\.venv\Scripts\activate
# (Hoặc nếu bạn đang ở thư mục gốc CinemaPBL5 thì gõ: .venv\Scripts\activate)

# BƯỚC 3: Chạy server
python manage.py runserver




# BƯỚC 1: Di chuyển vào thư mục frontend
cd Cinema_PBL5_Project/frontend

# BƯỚC 2: Chạy server
npm run dev