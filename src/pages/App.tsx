import { useRoutes } from "react-router-dom";
import routes from "@/routes/index";

const App = ()=>{
  const routing = useRoutes(routes);
  if(process.env.NODE_ENV === 'development'){
    var a = 1;
  }
  return <>{routing}</>
}

export default App;