<script>
const uuidv4 = require('uuid/v4');
import store from '@/store';
import makeBlockie from 'ethereum-blockies-base64';
export default {
  props: ['address'],
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
  <div :id="this.uuid"></div>
</template>
