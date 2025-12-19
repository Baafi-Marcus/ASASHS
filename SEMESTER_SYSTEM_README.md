# Semester-Based Academic System Implementation

This document describes the implementation of the semester-based academic system for ASASHS.

## Overview

The semester-based academic system implements a two-semester structure for each form (year) in the academic calendar:
- Form 1 Semester 1 (F1S1) and Form 1 Semester 2 (F1S2)
- Form 2 Semester 1 (F2S1) and Form 2 Semester 2 (F2S2)
- Form 3 Semester 1 (F3S1) and Form 3 Semester 2 (F3S2)

This creates a total of 6 class periods per course:
- 3 Forms × 2 Semesters = 6 classes per course

## Key Features

### 1. Database Schema Changes
- Added `semester` column to the `classes` table (INTEGER, values 1 or 2)
- Updated class naming convention to include semester (e.g., "General Science 1A S1")
- Added indexes for improved query performance

### 2. Class Management
- Classes are now identified by form, semester, and stream
- Automatic stream generation considers both form and semester
- Class creation form includes semester selection

### 3. Student Enrollment
- Students are enrolled in classes with specific form and semester
- Elective subject combinations are maintained across semesters for the same form
- Automatic class assignment based on elective selections

### 4. Academic Progression
Four types of student promotions are supported:
1. **Semester Progression**: F1S1 → F1S2 (same form, next semester)
2. **Form Progression**: F1S2 → F2S1 (next form, first semester)
3. **Year-End Progression**: Comprehensive promotion at academic year end
4. **Manual Promotion**: Custom form/semester transitions

### 5. Promotion Workflows

#### Semester Progression (F1S1 → F1S2)
- Moves students from semester 1 to semester 2 within the same form
- Maintains the same elective subject combination
- Occurs mid-year when Semester 1 ends

#### Form Progression (F1S2 → F2S1)
- Moves students from the final semester of one form to the first semester of the next form
- Maintains the same elective subject combination
- Occurs at the end of the academic year for Form 1 students

#### Academic Year End
- Comprehensive promotion that handles all transitions:
  - F1S2 → F2S1
  - F2S2 → F3S1
  - F1S1 → F1S2
  - F2S1 → F2S2
  - F3S1 → F3S2

## Implementation Details

### Database Migration
The migration script adds the semester field to existing classes and updates class names to include semester information.

### Backend Changes
- Updated `createClass` function to accept semester parameter
- Enhanced `findOrCreateClassForElectives` to consider semester when finding/creating classes
- Modified `getClasses` and `getClassWithSubjects` to support semester filtering
- Updated `promoteStudentsToNextForm` to handle semester-based promotions

### Frontend Changes
- Updated Course Management interface to include semester selection
- Added new promotion buttons for semester and academic year transitions
- Modified class display to show semester information

## Usage Instructions

### Creating Classes
1. Navigate to Course Management → Classes
2. Click "Add Class"
3. Fill in class details including form and semester
4. Select elective subjects (4 required)
5. Submit to create the class

### Student Enrollment
1. Navigate to Student Management
2. Select course, form, and semester for the student
3. Choose elective subjects (system will auto-assign to appropriate class)
4. Complete registration

### Academic Progression
Use the buttons in Course Management → Subjects:
- **Promote S1→S2**: Moves students from semester 1 to semester 2 within the same form
- **Promote F1S2→F2S1**: Moves Form 1 students from semester 2 to Form 2 semester 1
- **End Academic Year**: Performs all required promotions for year-end transition

## Technical Notes

### Class Naming Convention
Classes follow the pattern: `{Course} {Form} {Electives} S{Semester}`
Example: "General Science 1 Physics-Chemistry S1"

### Stream Generation
Streams are automatically generated considering both form and semester to ensure unique class identifiers.

### Data Consistency
The system maintains elective subject combinations across semesters for the same student, ensuring continuity of education.

## Future Enhancements
1. Academic calendar management
2. Semester scheduling and timetabling
3. Progress tracking and reporting
4. Automated promotion scheduling