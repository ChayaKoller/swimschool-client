
import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import SchedulePage from "../pages/SchedulePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import NotFoundPage from "../pages/NotFoundPage";
import ErrorPage from "../pages/ErrorPage";

import AppLayout from "../components/layout/AppLayout";
import RequireAuth from "./RequireAuth";
import RequireRole from "./RequireRole";
import StudentsPage from "../pages/StudentsPage";
import StudentFormPage from "../pages/StudentFormPage";
import StudentDetailsPage from "../pages/StudentDetailsPage";
import GroupsPage from "../pages/GroupsPage";
import GroupFormPage from "../pages/GroupPageForm";
import GroupDetailsPage from "../pages/GroupDetailsPage";
import LessonAttendancePage from "../pages/LessonAttendancePage";
import GroupAttendancePage from "../pages/GroupAttendancePage";
import SettingsPage from "../pages/SettingsPage";
import ReportsPage from "../pages/ReportsPage";
import ReportFormPage from "../pages/ReportFormPage";
import SecretariesPage from "../pages/SecretariesPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/account/password",
            element: <ChangePasswordPage/>,
          },
          {
            element: <RequireRole role="Teacher" />,
            children: [
              {
                path: "/schedule",
                element: <SchedulePage/>,
              },
              {
                path: "/lessons/:id/attendance",
                element: <LessonAttendancePage/>,
              },
             {
                path: "/groups/:id/attendance",
                element: <GroupAttendancePage/>,
              } ,
               {
                path: "/settings",
                element: <SettingsPage/>,
              } ,
               {
                path: "/secretaries",
                element: <SecretariesPage/>,
              } 
            ],
          },
          {
            path: "/students",
            element: <StudentsPage />

          },
          {
            path: "/students/new",
            element: <StudentFormPage />

          },
          {
            path: "/students/:id",
            element: <StudentDetailsPage />

          },
          {
            path: "/students/:id/edit",
            element: <StudentFormPage/>
          },
          {path:"/reports",
            element:<ReportsPage/>

          },
          {path:"/reports/new",
            element:<ReportFormPage/>

          },
          {path:"/reports/:id/edit",
            element:<ReportFormPage/>

          },
          { path: "groups", element: <GroupsPage /> },
          { path: "groups/new", element: <GroupFormPage /> },
          { path: "groups/:id", element: <GroupDetailsPage /> },
          { path: "groups/:id/edit", element: <GroupFormPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);