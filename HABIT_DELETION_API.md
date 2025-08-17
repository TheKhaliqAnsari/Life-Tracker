# Habit Deletion API Documentation

This document explains how to use the various habit deletion and cleanup APIs in your habit tracking application.

## Overview

The application now provides multiple ways to manage habits and their tracking data:

1. **Soft Delete** - Deactivates habits (sets `isActive: false`) but keeps data
2. **Hard Delete** - Permanently removes habits and all their tracking data
3. **Bulk Delete** - Delete multiple habits at once
4. **Data Cleanup** - Remove old tracking data while keeping habits

## API Endpoints

### 1. Individual Habit Deletion

**Endpoint:** `DELETE /api/habits/[id]`

**Query Parameters:**
- `hard=true` - Perform hard delete (default: soft delete)

**Examples:**

```bash
# Soft delete (deactivate habit)
DELETE /api/habits/64f8a1b2c3d4e5f6a7b8c9d0

# Hard delete (permanently remove habit and tracking data)
DELETE /api/habits/64f8a1b2c3d4e5f6a7b8c9d0?hard=true
```

**Response (Soft Delete):**
```json
{
  "message": "Habit deactivated successfully",
  "deactivatedHabit": "Exercise Daily"
}
```

**Response (Hard Delete):**
```json
{
  "message": "Habit and all tracking data deleted permanently",
  "deletedHabit": "Exercise Daily",
  "deletedTrackingRecords": 45
}
```

### 2. Bulk Habit Deletion

**Endpoint:** `POST /api/habits/bulk-delete`

**Request Body:**
```json
{
  "habitIds": ["64f8a1b2c3d4e5f6a7b8c9d0", "64f8a1b2c3d4e5f6a7b8c9d1"],
  "hardDelete": true
}
```

**Parameters:**
- `habitIds` (required): Array of habit IDs to delete
- `hardDelete` (optional): Boolean, defaults to `true`

**Response (Hard Delete):**
```json
{
  "message": "Habits and all tracking data deleted permanently",
  "deletedHabits": ["Exercise Daily", "Read Books"],
  "deletedHabitsCount": 2,
  "deletedTrackingRecords": 89
}
```

**Response (Soft Delete):**
```json
{
  "message": "Habits deactivated successfully",
  "deactivatedHabits": ["Exercise Daily", "Read Books"],
  "deactivatedCount": 2
}
```

### 3. Data Cleanup

**Endpoint:** `POST /api/habits/cleanup`

**Request Body:**
```json
{
  "habitIds": ["64f8a1b2c3d4e5f6a7b8c9d0"],
  "olderThanDays": 30,
  "keepLastDays": 7
}
```

**Parameters:**
- `habitIds` (optional): Array of specific habit IDs to clean. If empty, cleans all user's habits
- `olderThanDays` (optional): Remove data older than X days. Default: 30
- `keepLastDays` (optional): Always keep the last X days of data. Default: 7

**Response:**
```json
{
  "message": "Old tracking data cleaned up successfully",
  "cleanedRecords": 156,
  "habitsAffected": 3,
  "cutoffDate": "2024-01-15T00:00:00.000Z",
  "keptDataAfter": "2024-02-07T00:00:00.000Z"
}
```

## Use Cases

### Scenario 1: Temporary Break from a Habit
- Use **soft delete** to deactivate the habit
- Habit and tracking data remain intact
- Can easily reactivate later by setting `isActive: true`

### Scenario 2: Permanently Remove a Habit
- Use **hard delete** to completely remove the habit
- All tracking data is permanently deleted
- Useful for habits you no longer want to track

### Scenario 3: Clean Up Old Data
- Use **data cleanup** to remove old tracking records
- Keeps recent data for analysis
- Reduces database size
- Good for maintenance

### Scenario 4: Remove Multiple Habits
- Use **bulk delete** for efficiency
- Delete several habits at once
- Choose between soft and hard delete

## Frontend Integration Examples

### JavaScript/React Example

```javascript
// Hard delete a single habit
const deleteHabit = async (habitId) => {
  try {
    const response = await fetch(`/api/habits/${habitId}?hard=true`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Deleted: ${result.deletedHabit}`);
      // Refresh habits list
    }
  } catch (error) {
    console.error('Error deleting habit:', error);
  }
};

// Bulk delete multiple habits
const bulkDeleteHabits = async (habitIds) => {
  try {
    const response = await fetch('/api/habits/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        habitIds,
        hardDelete: true
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Deleted ${result.deletedHabitsCount} habits`);
      // Refresh habits list
    }
  } catch (error) {
    console.error('Error bulk deleting habits:', error);
  }
};

// Clean up old data
const cleanupOldData = async (habitIds = [], olderThanDays = 30) => {
  try {
    const response = await fetch('/api/habits/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        habitIds,
        olderThanDays,
        keepLastDays: 7
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Cleaned ${result.cleanedRecords} records`);
    }
  } catch (error) {
    console.error('Error cleaning up data:', error);
  }
};
```

## Security Features

- All endpoints require authentication via JWT token
- Users can only delete their own habits
- Input validation prevents malicious requests
- Proper error handling and logging

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `404` - Habit not found
- `500` - Internal server error

## Best Practices

1. **Use soft delete** for temporary deactivation
2. **Use hard delete** only when you're certain you want to permanently remove data
3. **Regular cleanup** helps maintain database performance
4. **Backup important data** before bulk operations
5. **Test deletion operations** in development first

## Database Impact

- **Soft delete**: No data loss, minimal impact
- **Hard delete**: Permanent data removal, frees up storage
- **Cleanup**: Reduces database size, improves query performance
- **Bulk operations**: More efficient than individual deletions 