import { createApp } from 'vue';
import '@wikimedia/codex/dist/codex.style.css';
import App from './App.vue';
import OperationsApp from './OperationsApp.vue';

createApp(
	window.__INSTALLER_STATE__?.operationsPanel ? OperationsApp : App
).mount( '#app' );
