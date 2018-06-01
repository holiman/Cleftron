<script>
import uuidv4 from 'uuid/v4';
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
      store: store,
      uuid: ''
    };
  },
  created: function() {
    this.uuid = uuidv4();
  },
  mounted: function() {
    const img = new Image(75, 75);
    img.src = makeBlockie(this.address);
    this.$el.appendChild(img);
  }
};
</script>

<template>
  <div :id="uuid" />
</template>
