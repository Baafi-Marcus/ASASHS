# Student Class Assignment and Promotion System

## Overview

This document explains the new automatic class assignment and student promotion features implemented in the ASASHS system.

## Features Implemented

### 1. Automatic Class Creation Based on Elective Subjects

When registering a student:
- If no classes exist for a selected course, the system will automatically create a class based on the student's elective subject combination
- If a class with the same elective combination already exists, the student will be assigned to that class
- If no class exists with the same combination, a new class will be created automatically

### 2. Student Promotion from Form 1 to Form 2

After two semesters, students can be promoted from Form 1 to Form 2:
- All students in Form 1 classes will be moved to corresponding Form 2 classes
- If a Form 2 class doesn't exist for a particular subject combination, it will be created automatically
- Class subject relationships are preserved during promotion

## How It Works

### Student Registration Process

1. Admin selects a course for the student
2. Admin selects 4 elective subjects for the student
3. System checks if a class exists with the same elective combination:
   - If yes: Assigns student to existing class
   - If no: Creates new class with unique stream identifier and assigns student
4. Student is registered with the assigned class

### Class Naming Convention

Automatically created classes follow this naming pattern:
`{CourseName} {FormNumber} {Subject1}-{Subject2}-{Subject3}-{Subject4}`

Example: `General Science 1 Physics-Chemistry-Biology-Mathematics`

### Student Promotion Process

1. Admin clicks "Promote Students to Form 2" button in Course Management
2. System identifies all students in Form 1 classes
3. For each student:
   - Finds or creates corresponding Form 2 class
   - Moves student to the Form 2 class
4. Students are now in Form 2 with same subject combinations

## Database Changes

### New Table: class_subjects

Stores the relationship between classes and subjects:
- `class_id`: References classes.id
- `subject_id`: References subjects.id
- `is_elective`: Boolean indicating if subject is elective

### New Indexes

Added indexes for better query performance:
- `idx_students_current_class_id`: For student class lookups
- `idx_classes_form`: For form-based class filtering
- `idx_class_subjects_class_id`: For class-subject relationship queries
- `idx_class_subjects_subject_id`: For subject-based class queries

## Admin Interface

### Student Registration Form

- Elective subject selection is now required when no classes exist for a course
- Automatic class assignment feedback is provided to the admin

### Course Management Page

- New "Promote Students to Form 2" button in the Subjects tab
- Enhanced class creation form with automatic stream assignment

## Error Handling

The system includes comprehensive error handling:
- Validates that all 4 elective subjects are selected before creating classes
- Provides clear error messages for database issues
- Ensures data integrity during class creation and student assignment

## Future Enhancements

Potential improvements for future versions:
- Semester tracking for automatic promotion
- Class capacity monitoring
- More sophisticated class naming conventions
- Bulk student assignment tools