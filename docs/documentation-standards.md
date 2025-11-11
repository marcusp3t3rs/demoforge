# DemoForge Documentation Standards

## User Story Status Labels

To maintain consistency across all epics and ensure clear project tracking, use the following standardized status labels:

### Status Legend
- **🟢 Closed** - Fully implemented, tested, and complete
- **🚧 In Progress** - Currently being developed or actively worked on
- **🔄 Deferred** - Moved to another epic for better integration or technical reasons
- **📋 Backlog** - Planned for future iterations within the current epic
- **⏸️ Blocked** - Waiting on dependencies, decisions, or external factors
- **❌ Cancelled** - Decided not to implement (include reason in notes)

### Usage Guidelines

#### When to use **🟢 Closed**:
- Feature is fully implemented
- All acceptance criteria met
- Code committed and merged
- Documentation updated

#### When to use **🚧 In Progress**:
- Active development happening
- Story has been started but not completed
- Clear progress being made

#### When to use **🔄 Deferred**:
- Story moved to different epic for better technical integration
- Dependencies require different ordering
- Include destination epic in notes: `*(→ Epic 2)*`

#### When to use **📋 Backlog**:
- Story planned but not yet started
- Part of current epic scope
- Will be implemented in future iteration

#### When to use **⏸️ Blocked**:
- Cannot proceed due to external dependencies
- Waiting for architectural decisions
- Technical blockers preventing progress
- Always include reason in notes

#### When to use **❌ Cancelled**:
- Decided not to implement the story
- Requirements changed making story obsolete
- Always include reason for cancellation

### Example Usage

```markdown
### Stories
- [x] [#19] E0-US0 Initial Setup **🟢 Closed**
- [x] [#11] E0-US1 App Shell & Navigation **🟢 Closed** *(RBAC → Epic 1)*
- [ ] [#12] E0-US2 Admin Sign-In **🔄 Deferred** *(Epic 1 integration)*
- [ ] [#15] E0-US5 Audit Preview **📋 Backlog** *(Sprint 2)*
- [ ] [#20] E0-US9 Advanced Analytics **❌ Cancelled** *(moved to V1 scope)*
```

### Cross-Epic References

When deferring stories between epics:
1. Mark original story as **🔄 Deferred** with destination
2. Add story to destination epic as **🔄 Deferred** with source reference
3. Update iteration plans in both epics
4. Maintain traceability in scope sections

### Commit Message Standards

When updating story status:
```bash
git commit -m "docs: Mark E0-US1 as 🟢 Closed with Epic 1 deferrals

- Update E0-US1 status to closed
- Defer RBAC components to E1-US9-US11
- Update iteration plans accordingly"
```

This ensures clear project tracking and makes progress visible to all stakeholders.