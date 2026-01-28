import { createRouter, createWebHistory } from "vue-router";
import NewReportView from "../views/NewReportView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "new-report", component: NewReportView },
  ],
});

export default router;
