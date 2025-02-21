import Header from "@/components/common/Header";
import { Outlet } from 'react-router-dom';
import { memo } from 'react';
const MainLayout = () =>{
  return (
    <>
      <Header />
      <main className="mx-auto px-4">
        <Outlet />
      </main>
    </>
  );
}

export default memo(MainLayout);