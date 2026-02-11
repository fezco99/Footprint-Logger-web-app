const express = require("express");
const Activity = require("../models/Activity");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* CREATE ACTIVITY */
router.post("/", auth, async (req, res) => {
  const activity = new Activity({
    ...req.body,
    userId: req.user.id,
  });

  await activity.save();
  res.json(activity);
});

/* GET USER ACTIVITIES */
router.get("/my", auth, async (req, res) => {
  const activities = await Activity.find({ userId: req.user.id });
  res.json(activities);
});

/* USER DASHBOARD SUMMARY */
router.get("/dashboard/summary", auth, async (req, res) => {
  const activities = await Activity.find({ userId: req.user.id });

  const total = activities.reduce((sum, a) => sum + a.co2, 0);

  res.json({
    totalEmissions: total,
    activityCount: activities.length,
  });
});

/* WEEKLY SUMMARY */
router.get("/weekly", auth, async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const activities = await Activity.find({
    userId: req.user.id,
    date: { $gte: oneWeekAgo },
  });

  const total = activities.reduce((sum, a) => sum + a.co2, 0);

  res.json({
    weeklyTotal: total,
    activities,
  });
});

/* STREAK TRACKING */
router.get("/streak", auth, async (req, res) => {
  const activities = await Activity.find({ userId: req.user.id }).sort({
    date: -1,
  });

  if (activities.length === 0) return res.json({ streak: 0 });

  let streak = 1;
  let currentDate = new Date(activities[0].date);

  for (let i = 1; i < activities.length; i++) {
    const prevDate = new Date(activities[i].date);

    const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  res.json({ streak });
});

/* LEADERBOARD */
router.get("/leaderboard", async (req, res) => {
  const results = await Activity.aggregate([
    {
      $group: {
        _id: "$userId",
        total: { $sum: "$co2" },
      },
    },
    {
      $sort: { total: 1 },
    },
    {
      $limit: 10,
    },
  ]);

  res.json(results);
});
