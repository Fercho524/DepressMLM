import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/StudentList";
import UserList from "./pages/UserList";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDetail from "./pages/StudentDetail";
import EditStudent from "./pages/EditStudent";
import AccountDetails from "./pages/AccountDetails";
import EditAccount from "./pages/EditAccount";
import UserDetails from "./pages/UserDetails";
import UserUpdate from "./pages/UserUpdate";
import StudentReports from "./pages/StudentReports";
import ReportDetails from "./pages/ReportDetails";
import GenerateReport from "./pages/GenerateReport";
import AddStudent from "./pages/AddStudent";
import EditReport from "./pages/EditReport";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:boleta"
          element={
            <ProtectedRoute>
              <StudentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:boleta/reports"
          element={
            <ProtectedRoute>
              <StudentReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/edit/:boleta"
          element={
            <ProtectedRoute>
              <EditStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:reportId"
          element={
            <ProtectedRoute>
              <ReportDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-report/:reportId"
          element={
            <ProtectedRoute>
              <EditReport />
            </ProtectedRoute>
          }
        />


        <Route
          path="/students/:boleta/generate-report"
          element={
            <ProtectedRoute>
              <GenerateReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/add"
          element={
            <ProtectedRoute>
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountDetails />
            </ProtectedRoute>
          }
        />



        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/edit"
          element={
            <ProtectedRoute>
              <EditAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/details/:userId"
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/update/:userId"
          element={
            <ProtectedRoute>
              <UserUpdate />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
