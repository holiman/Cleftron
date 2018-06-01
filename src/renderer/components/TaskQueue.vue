<template>
  <b-form-group
    horizontal
    breakpoint="lg"
    label="Tasks"
    label-size="mg"
    label-class="font-weight-bold pt-0"
    class="mb-0">
    <b-list-group>
      <b-list-group-item
        v-for="item in tasks"
        :key="item.id"
        :active="state.selected.id==item.id"
        button
        @:click="select(item.id)">
        Request #{{ item.id }}:
        {{ item.ui }}
      </b-list-group-item>
    </b-list-group>
  </b-form-group>
</template>

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
