# Merit/demerit point management system

## Overview
A web app designed for school that uses merit/demerit point system to track and manage student's merit points.

<img width="1202" height="906" alt="image" src="https://github.com/user-attachments/assets/a4480442-3ed0-4df6-a403-8157444db91e" />
<img width="1194" height="899" alt="image" src="https://github.com/user-attachments/assets/32c4b131-1c0b-4174-8f13-5acfae85ed32" />

## Live Demo
Demo link: https://merit-point-management-system.netlify.app

## Functionalities
- **Dashboard** Summary of key metrics like average points of students, recent activities, etc.
- **Reports & Analytics** Generates statistics to analyze student behavior and point trends.
- **Class/Group Management** Organize students into classes or groups for easier management and reporting.
- **Merit/Demerit Point Allocation** Award or deduct points from students with custom reasons. Includes date/time tracking and optional comments/descriptions.
- **User Roles & Permissions** Role-based access system with different capabilities for admins, teachers, and students.
- **Leaderboards** Ranked list of students based on their accumulated merit points.

## Admin capabilities
- Create invitation codes for teachers and students to sign up.
- Manage academic structures (add/delete classes or streams). 
- Configure leaderboard:
  - Exclude students by email.
  - Show names, usernames, or let students choose.
  - Allow opt-out or disable leaderboard completely.
- Set initial merit points for new students.
- Customize system appearance (primary color & school logo).

## Technologies Used
- **Frontend**: React.js, Bootstrap
- **Backend**: Laravel
- **Database**: Mysql
