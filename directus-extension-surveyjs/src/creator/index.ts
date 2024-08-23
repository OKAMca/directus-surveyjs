import { defineModule } from '@directus/extensions-sdk';
import CreatorApp from './components/CreatorApp.vue';
import Home from './components/Home.vue';

export default defineModule({
	id: 'surveys',
	name: '$t:extension_survey_module_name',
	icon: 'content_paste_search',
	hidden: false,
	routes: [
		{
			path: '',
			props: true,
			component: Home,
		},
		{
			name: '$t:form_creator',
			path: ':form',
			props: true,
			component: CreatorApp,
		}
	],
});
