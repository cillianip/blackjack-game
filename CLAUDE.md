# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Dev Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm test -- -t "test name"` - Run specific test

## Code Style Guidelines
- **TypeScript**: Use strict typing with interfaces/enums in `models/types.ts`
- **Formatting**: Follow ESLint config with 2-space indentation
- **Imports**: Group by: 1) React/libraries 2) Components 3) Utils/models
- **Naming**: PascalCase for components/classes, camelCase for functions/variables
- **Error Handling**: Use optional chaining and null checks (`card?`, `card!`)
- **Components**: Functional components with explicit prop interfaces
- **State Management**: Redux with typed actions and reducers
- **Testing**: Jest with clear describe/test blocks and specific assertions

## Notes
- Check tsconfig for strict linting rules (noUnusedLocals, noUnusedParameters)
- Follow existing patterns in similar files when creating new components