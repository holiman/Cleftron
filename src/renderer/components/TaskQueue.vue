<script>
import store from '@/store';
export default {
  data() {
    return {
      tasks: store.state.tasks,
      state: store.state
    };
  },
  methods: {
    select(id) {
      store.dispatch('selectTask', id);
    }
  }
};
</script>

<template>
	<b-form-group horizontal
			breakpoint="lg"
			label="Tasks"
			label-size="mg"
			label-class="font-weight-bold pt-0"
			class="mb-0">
		<b-list-group>
				<b-list-group-item button
				v-for="(item, key) in tasks" :key="item.id"
				v-on:click="select(item.id)"
				:active="state.selected.id==item.id">
				{{ item.id }}:{{ item.ui }}
			</b-list-group-item>
		</b-list-group>
	</b-form-group>
</template>
