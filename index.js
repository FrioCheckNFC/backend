/**
 * Azure Web App Fail-safe Entry Point
 * Redirects to the compiled NestJS entry point in the dist folder.
 */
try {
    console.log('--- Azure Fail-safe: Starting from root index.js ---');
    // We try to require the flat dist/main first (new structure)
    require('./dist/main');
} catch (e) {
    console.error('--- Azure Fail-safe: dist/main not found, trying dist/src/main ---');
    try {
        require('./dist/src/main');
    } catch (e2) {
        console.error('--- Azure Fail-safe ERROR: Could not find entry point ---');
        console.error(e2);
        process.exit(1);
    }
}
