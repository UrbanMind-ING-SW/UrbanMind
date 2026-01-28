import { createRouter, createWebHistory } from "vue-router";
import "../assets/main.css";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "proposals",
      component: () => import("../views/ProposalsView.vue"),
    },
    {
      path: "/proposals/new",
      name: "proposal-new",
      component: () => import("../views/NewProposalView.vue"),
    },
  ],
});

export default router;
