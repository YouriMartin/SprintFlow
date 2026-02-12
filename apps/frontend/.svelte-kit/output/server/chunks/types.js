var TaskStatus = /* @__PURE__ */ ((TaskStatus2) => {
  TaskStatus2["TODO"] = "todo";
  TaskStatus2["IN_PROGRESS"] = "in_progress";
  TaskStatus2["DONE"] = "done";
  return TaskStatus2;
})(TaskStatus || {});
var TaskPriority = /* @__PURE__ */ ((TaskPriority2) => {
  TaskPriority2["LOW"] = "low";
  TaskPriority2["MEDIUM"] = "medium";
  TaskPriority2["HIGH"] = "high";
  TaskPriority2["URGENT"] = "urgent";
  return TaskPriority2;
})(TaskPriority || {});
var EpicStatus = /* @__PURE__ */ ((EpicStatus2) => {
  EpicStatus2["PLANNED"] = "planned";
  EpicStatus2["IN_PROGRESS"] = "in_progress";
  EpicStatus2["COMPLETED"] = "completed";
  EpicStatus2["CANCELLED"] = "cancelled";
  return EpicStatus2;
})(EpicStatus || {});
var UserStoryStatus = /* @__PURE__ */ ((UserStoryStatus2) => {
  UserStoryStatus2["TODO"] = "todo";
  UserStoryStatus2["IN_PROGRESS"] = "in_progress";
  UserStoryStatus2["DONE"] = "done";
  return UserStoryStatus2;
})(UserStoryStatus || {});
var UserStoryPriority = /* @__PURE__ */ ((UserStoryPriority2) => {
  UserStoryPriority2["LOW"] = "low";
  UserStoryPriority2["MEDIUM"] = "medium";
  UserStoryPriority2["HIGH"] = "high";
  UserStoryPriority2["URGENT"] = "urgent";
  return UserStoryPriority2;
})(UserStoryPriority || {});
export {
  EpicStatus as E,
  TaskPriority as T,
  UserStoryPriority as U,
  TaskStatus as a,
  UserStoryStatus as b
};
