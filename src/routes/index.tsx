import PageNotFoundView from '@/components/common/PageNotFoundView';
import MainLayout from '@/layouts/Layout';
import { RouteObject } from 'react-router-dom';

const Routes: RouteObject[] = []
const mainRoutes = {
  path:'/',
  element: <MainLayout />,
  children:[
    { path:'*',element:<PageNotFoundView/> },
    { path: '404', element: <PageNotFoundView /> },
  ]
}
Routes.push(mainRoutes);


export default Routes;