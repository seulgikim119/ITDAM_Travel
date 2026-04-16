import { createBrowserRouter } from "react-router";
import { Onboarding } from "./components/onboarding-page";
import { Home } from "./components/itgaebi-road-page";
import { CreateRoute } from "./components/create-route-page";
import { RouteGenerating } from "./components/route-generating-page";
import { RouteResult } from "./components/route-result-page";
import { RecordInput } from "./components/record-input-page";
import { Recommendation } from "./components/recommendation-page";
import { SavedPlaces } from "./components/itgaebi-pick-page";
import { MyPage } from "./components/damggaebi-vault-page";
import { AppLayout } from "./components/app-tab-layout";
import { SnapRoute } from "./components/snap-route-page";
import { TravelSketchbook } from "./components/damggaebi-land-page";
import { RoutineDetail } from "./components/routine-detail-page";
import { Login } from "./components/login-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Onboarding,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      { index: true, Component: Home },
      { path: "saved", Component: SavedPlaces },
      { path: "record", Component: TravelSketchbook },
      { path: "my", Component: MyPage },
    ],
  },
  { path: "/create-route", Component: CreateRoute },
  { path: "/snap-route", Component: SnapRoute },
  { path: "/route-generating", Component: RouteGenerating },
  { path: "/route-result", Component: RouteResult },
  { path: "/record-input", Component: RecordInput },
  { path: "/recommendation", Component: Recommendation },
  { path: "/travel-sketchbook", Component: TravelSketchbook },
  { path: "/routine/:routineId", Component: RoutineDetail },
]);
