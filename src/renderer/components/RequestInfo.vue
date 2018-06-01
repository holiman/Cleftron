<template>
  <b-form-group
    vertical
    label="Request Info"
    label-size="mg"
    label-class="font-weight-bold pt-0"
    class="mb-0">
    <b-form-group
      horizontal
      label="Remote:"
      label-class="text-sm-right"
      label-for="remote">
      <b-form-input
        id="remote"
        :value="store.state.selected.obj.params[0].meta.remote"
        plaintext />
    </b-form-group>
    <b-form-group
      horizontal
      label="Transport:"
      label-class="text-sm-right"
      label-for="transport">
      <b-form-input
        id="transport" 
        :value="store.state.selected.obj.params[0].meta.scheme"
        plaintext />
    </b-form-group>
    <b-form-group
      horizontal
      label="Local Enpoint:"
      label-class="text-sm-right"
      label-for="endpoint">
      <b-form-input
        id="endpoint"
        :value="store.state.selected.obj.params[0].meta.local"
        plaintext />
    </b-form-group>
  </b-form-group>
</template>

<script>
import store from '@/store';
export default {
  data() {
    return {
      store: store
    };
  }
};
</script>
