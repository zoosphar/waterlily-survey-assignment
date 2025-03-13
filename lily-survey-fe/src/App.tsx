import { useEffect } from "react";
import "./App.css";
import FormScreen from "./screens/form/Form";
import { Toaster } from "./components/ui/sonner";
import ViewFormResponses from "./screens/form/ViewFormResponses";

function App() {
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.location.href = "/form/1";
    }
  }, []);

  if (
    window.location.pathname &&
    window.location.pathname.includes("/form/review/")
  ) {
    const formId = window.location.pathname.split("/")[3];
    return (
      <div className="bg-gray-100 flex justify-center w-full items-center p-6 overflow-y-scroll">
        <ViewFormResponses formId={formId} />
      </div>
    );
  }

  if (window.location.pathname && window.location.pathname.includes("/form")) {
    const formId = window.location.pathname.split("/")[2];
    return (
      <div className="bg-gray-100 flex justify-center w-full items-center p-6 overflow-y-scroll">
        <Toaster />
        <FormScreen formId={formId} />
      </div>
    );
  }
}

export default App;
