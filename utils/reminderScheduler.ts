// utils/reminderScheduler.ts

let cron: any;

// Only import node-cron on the server side
if (typeof window === 'undefined') {
  cron = require('node-cron');
}

class ReminderScheduler {
  private static instance: ReminderScheduler;
  private tasks: Map<string, any>;

  private constructor() {
    this.tasks = new Map();
  }

  public static getInstance(): ReminderScheduler {
    if (!ReminderScheduler.instance) {
      ReminderScheduler.instance = new ReminderScheduler();
    }
    return ReminderScheduler.instance;
  }

  public scheduleReminder(id: string, cronExpression: string, callback: () => void): void {
    // Only schedule if we're on the server side
    if (typeof window === 'undefined' && cron) {
      // Stop existing task if it exists
      this.stopReminder(id);

      // Create new task
      const task = cron.schedule(cronExpression, callback);
      this.tasks.set(id, task);
    }
  }

  public stopReminder(id: string): void {
    if (typeof window === 'undefined') {
      const task = this.tasks.get(id);
      if (task) {
        task.stop();
        this.tasks.delete(id);
      }
    }
  }

  public stopAll(): void {
    if (typeof window === 'undefined') {
      this.tasks.forEach(task => task.stop());
      this.tasks.clear();
    }
  }
}

export default ReminderScheduler;