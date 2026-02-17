# TODO: Integrate session_id from localStorage into projectsService.ts

- [x] Update selectProject method to retrieve sessionId from localStorage using the project-specific key
- [x] Pass the retrieved sessionId to startSession instead of project.id
- [x] Fix the payload in startSession by removing the erroneous localStorage line
