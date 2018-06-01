<template>
  <div :id="address" />
</template>

<script>
import store from '@/store';
import makeBlockie from 'ethereum-blockies-base64';

export default {
  props: {
    address: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      store: store
    };
  },
  mounted: function() {
    const img = new Image(75, 75);
    img.src = makeBlockie(this.address);
    this.$el.appendChild(img);
  },
  updated: function() {
    const img = this.$el.firstChild;
    img.src = makeBlockie(this.address);
  }
};
</script>
