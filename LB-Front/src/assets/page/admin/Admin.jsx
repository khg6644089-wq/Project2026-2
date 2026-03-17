import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import MemberManagement from "./MemberManagement";
import ClubMemberManagement from "./ClubMemberManagement";
import ClubManagement from "./ClubManagement";
import ClubDetail from "./ClubDetail";

function Admin() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />
      <Route
        path="/members"
        element={
          <AdminLayout>
            <MemberManagement />
          </AdminLayout>
        }
      />
      <Route
        path="/club-members"
        element={
          <AdminLayout>
            <ClubMemberManagement />
          </AdminLayout>
        }
      />
      <Route
        path="/clubs"
        element={
          <AdminLayout>
            <ClubManagement />
          </AdminLayout>
        }
      />
      <Route
        path="/clubs/:id"
        element={
          <AdminLayout>
            <ClubDetail />
          </AdminLayout>
        }
      />
    </Routes>
  );
}

export default Admin;
