import React from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { Route, Routes } from "react-router-dom";

function Member() {
  return (
    <>
      <Routes>
        <Route index element={<SignIn />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
      </Routes>
    </>
  );
}

export default Member;
