# Auto-Absent Feature Documentation

## Overview
The HR System automatically marks employees as **Absent** if they don't mark their attendance by the end of the day (11:59 PM IST).

## How It Works

### Automatic Execution
- **Schedule:** Every day at 11:59 PM IST
- **Process:**
  1. System checks all employees (excluding admins)
  2. For each employee who joined on or before today
  3. If attendance not marked for today
  4. Automatically creates an "Absent" record

### Business Rules
✅ Only applies to employees (not admins)  
✅ Only for employees who have already joined (joining date ≤ today)  
✅ Skips employees who already marked attendance  
✅ Runs automatically every night  

## Manual Testing (Admin Only)

### API Endpoint
```
POST /api/cron/auto-absent
Authorization: Bearer <admin_token>
```

### Using Postman/Thunder Client
1. Login as admin to get token
2. Send POST request to `http://localhost:5000/api/cron/auto-absent`
3. Add header: `Authorization: Bearer YOUR_ADMIN_TOKEN`
4. Response: `{ "message": "Auto-absent job executed successfully" }`

### Check Results
- Go to Admin Dashboard → Attendance
- You'll see auto-generated "Absent" records for employees who didn't mark attendance

## Cron Schedule Format
```javascript
'59 23 * * *'  // Runs at 11:59 PM every day
```

## Timezone
- **Asia/Kolkata** (Indian Standard Time - IST)
- Adjust in `backend/config/cronJobs.js` if needed

## Console Logs
When the cron job runs, you'll see:
```
Running auto-absent cron job...
Auto-marked absent: John Doe (john@company.com)
Auto-marked absent: Jane Smith (jane@company.com)
Auto-absent cron job completed successfully
```

## Production Deployment
The cron job starts automatically when the server starts. No additional configuration needed!

## Troubleshooting

### Cron not running?
- Check server logs for: `Auto-absent cron job scheduled`
- Verify `node-cron` package is installed
- Ensure server is running continuously

### Wrong timezone?
- Update timezone in `backend/config/cronJobs.js`:
```javascript
cron.schedule('59 23 * * *', autoMarkAbsent, {
    timezone: 'Your/Timezone', // e.g., 'America/New_York'
});
```

## Files Modified
- `backend/config/cronJobs.js` - Cron job logic
- `backend/routes/cronRoutes.js` - Manual trigger endpoint
- `backend/server.js` - Cron job initialization
- `backend/package.json` - Added node-cron dependency
