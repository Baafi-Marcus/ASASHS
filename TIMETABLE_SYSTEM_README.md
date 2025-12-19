# Timetable Management System Implementation

This document describes the implementation of the timetable management system for ASASHS.

## Overview

The timetable management system allows administrators to upload detailed timetables in Excel format and provides teachers with personalized timetable views that can be downloaded or printed.

## Key Features

### 1. Admin Timetable Management
- Upload timetables in Excel format
- Download template for proper formatting
- View all timetable entries in a table format
- Manage timetables per academic year

### 2. Teacher Timetable Access
- Personalized timetable view filtered by teacher
- Grid view showing schedule by day and time slot
- List view of all timetable entries
- Download timetable as Excel file
- Print timetable functionality

### 3. Data Structure
- New `timetable_entries` table to store detailed timetable information
- Fields include: day, time_slot, class_id, subject_id, teacher_id, academic_year
- Proper indexing for efficient querying

## Implementation Details

### Database Schema
A new table `timetable_entries` was created with the following structure:
```sql
CREATE TABLE timetable_entries (
    id SERIAL PRIMARY KEY,
    day VARCHAR(10) NOT NULL, -- Mon, Tue, Wed, etc.
    time_slot VARCHAR(20) NOT NULL, -- 8-9 AM, 9-10 AM, etc.
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL, -- 2025/2026
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backend Functions
New functions were added to `neon.ts`:
1. `createTimetableEntry` - Create a new timetable entry
2. `getTimetableEntries` - Get timetable entries with optional filters
3. `getTeacherTimetable` - Get timetable entries for a specific teacher
4. `getClassTimetable` - Get timetable entries for a specific class
5. `deleteTimetableEntries` - Delete all timetable entries for an academic year

### Frontend Components
1. `AdminTimetableManagement.tsx` - Admin interface for uploading and managing timetables
2. `TeacherTimetable.tsx` - Teacher interface for viewing personal timetable

## Usage Instructions

### For Administrators
1. Navigate to "Timetable Management" in the admin panel
2. Select the academic year
3. Download the template Excel file if needed
4. Prepare your timetable data in the required format:
   - Columns: Day, Time Slot, Class, Subject, Teacher
5. Upload the completed Excel file
6. The system will automatically parse and store the timetable entries

### For Teachers
1. Log in to the teacher portal
2. Navigate to "My Timetable"
3. Select the academic year
4. View your timetable in grid or list format
5. Use "Download" to save your timetable as an Excel file
6. Use "Print" to print your timetable or save as PDF

## File Format Requirements

The Excel file should have the following columns:
- **Day**: Day of the week (Mon, Tue, Wed, etc.)
- **Time Slot**: Time period (8-9 AM, 9-10 AM, etc.)
- **Class**: Full class name as it appears in the system
- **Subject**: Subject name or code
- **Teacher**: Teacher ID or full name

## Security
- Only administrators can upload/modify timetables
- Teachers can only view/download/print their own timetable
- All data is filtered by academic year
- Proper authentication and authorization are enforced

## Technical Notes
- Uses the `xlsx` library for Excel file processing
- Implements proper error handling for file uploads
- Provides user feedback through toast notifications
- Responsive design for both desktop and mobile viewing
- Print-friendly CSS for timetable printing

## Future Enhancements
1. Class timetable views for teachers
2. Student timetable access
3. Timetable change notifications
4. Conflict detection during upload
5. Integration with calendar applications