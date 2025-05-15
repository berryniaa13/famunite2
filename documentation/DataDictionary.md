# Data Dictionary

## User

| Field name | Data Type | Description | Example |
|------------|------------|-------------|---------|
| userId | string | Primary key | “vovobv08934b” |
| name | string | First & Last Name | “Nia Berry” |
| role | string | [“Student”, “Organization Liaison”, “Event Moderator”, “Admin”] | “Student” |
| contact_info | string | Phone number | “540-834-3061” |
| email | string | Email address | “berryniaa13@gmail.com” |
| status | string | [“Active”,”Suspended”,”Banned”] | “Active” |
| interests | Array<string> | Selected from list of 20 event categories | {“Academic”, “Social”, “Political”} |
| organizationName | string | Name of organization saved upon creation | “Black Data Processing Associates” |
| createdAt | timestamp | Time user was created | May 3, 2025 at 4:34:58 PM UTC-4 |
| updatedAt | timestamp | Latest time user information updated | May 5, 2025 at 3:24:58 PM UTC-4 |

## Event

| Field name | Data Type | Description | Example |
|------------|------------|-------------|---------|
| eventId | string | Primary key | “iuvcb983g95buibv” |
| organizationId | string | Foreign  key | “icbiweb9783478kjb” |
| title | string | Name of the Event | “Hackathon” |
| category | string | (see event categories below) | “Academic” |
| description | string | Description of event | “Compete to win $400 dollars” |
| date | String | Date of event | “2025-05-02” |
| location | string | Location of event | “Commons” |
| createdAt | timestamp | Time event was created | May 3, 2025 at 4:34:58 PM UTC-4 |
| createdBy | string | Foreign key (userId) | May 3, 2025 at 4:34:58 PM UTC-4 |
| status | string | {“Pending”, “Approved”, “Flagged”, “Suspended”} | “Approved” |

## Organizations

| Field name | Data Type | Description | Example |
|------------|------------|-------------|---------|
| organizationId | string | Primary Key | “G34vkdhd2dd2d2” |
| name | string | Name of Organization | “Black Data Proccessing Associates” |
| liaisonId | string | Foreign Key (userId) Organization Liasion id | “erbik3fkhvdflbdwkh” |
| createdAt | timestamp | Date organization was created | May 3, 2025 at 4:34:58 PM UTC-4 |

## EventRequest

| Field name | Data Type | Description | Example |
|------------|------------|-------------|---------|
| requestId | string | Primary Key | “hgvd32uvq2u3vkde” |
| event | Object<Event> | Event object |  |
| submittedBy | string | Foreign Key (userId | “wejgv34kvg4evgew” |
| status | string | {“Pending”, “Approved”, “Denied”} | “Pending” |
| note | string | Comments on request | “Change name of event” |

## Registrations

| Field name | Data Type | Description | Example |
|------------|------------|-------------|---------|
| registrationId | string | Primary Key | “osdconfekfbedk78” |
| eventId | string | Foreign Key (Events) | “edwujg3v4k,egcdw” |
| userId | string | Foreign Key (User) | “43ujveluved87ceib” |
| timestamp | timestamp | Date user registered | May 3, 2025 at 4:34:58 PM UTC-4 |

## SavedEvents

| Field name | Data Type | Description | Example |
|------------|------------|-------------|---------|
| savedId | string | Primary Key |  |
| eventId | string | Foreign Key (Events) |  |
| userId | string | Foreign Key (User) |  |
| savedAt | timestamp | Date event was saved at | May 3, 2025 at 4:34:58 PM UTC-4 |

## Reviews

| Field name | Data Type | Description | Example |
|------------|------------|-------------|---------|
| reviewId | string | Primary Key |  |
| userId | string | Foreign Key (User) |  |
| comment | string | Comment user left with review |  |
| rating | int | Rating (1-5) |  |
| timestamp | timestamp | Date event was revied | May 3, 2025 at 4:34:58 PM UTC-4 |
| flagged | boolean | Whether event has been flagged for violating guidelines |  |

## Messages

| Field name | Data Type | Description | Example |
|------------|------------|-------------|---------|
| messageId | string | Primary Key |  |
| senderId | string | Foreign Key (User) |  |
| receiverId | string | Foreign Key (User) |  |
| content | string | Message content |  |
| createdAt | timestamp | Date message was created | May 3, 2025 at 4:34:58 PM UTC-4 |

## Announcements

| Field name | Data Type | Description | Example |
|------------|------------|-------------|---------|
| announceId | string | Primary key |  |
| postedBy | string | Foreign Key (User) |  |
| postedAt | timestamp | Date announcement was posted | May 3, 2025 at 4:34:58 PM UTC-4 |
| text | string | Announcement message |  |

## Event Categories

“Academic”, “Career / Professional Development”, “Workshops”, “Social”, “Cultural”, “Performing Arts / Entertainment”, “Community Service”, “Health & Wellness”, “Sports / Recreation”, “Religious / Spiritual”, “Club / Organization Meetings”, “Fundraisers”, “Networking Events”, “Student Government”, “Study Groups / Tutoring”, “Housing & Campus Life”, “Competitions / Hackathons”, “Tech / Innovation”, “Political”, “Alumni Events”
