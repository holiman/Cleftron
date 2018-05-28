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

<template>
    <b-form-group vertical
            breakpoint="lg"
            label="Request Info"
            label-size="mg"
            label-class="font-weight-bold pt-0"
            class="mb-0">
    <b-form-group horizontal
                    label="Remote:"
                    label-class="text-sm-right"
                    label-for="remote"
                    >
        <b-form-input  plaintext :value="store.state.selected.obj.params[0].meta.remote" id="remote"></b-form-input>
    </b-form-group>
    <b-form-group horizontal
                    label="Transport:"
                    label-class="text-sm-right"
                    label-for="transport">
        <b-form-input plaintext :value="store.state.selected.obj.params[0].meta.scheme" id="transport"></b-form-input>
    </b-form-group>
    <b-form-group horizontal
                    label="Local Enpoint:"
                    label-class="text-sm-right"
                    label-for="endpoint">
        <b-form-input plaintext :value="store.state.selected.obj.params[0].meta.local" id="endpoint"></b-form-input>
    </b-form-group>
</b-form-group>
</template>
