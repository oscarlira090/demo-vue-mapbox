<template>
  <Page>
    <GridLayout rows="*">
      <ListView for="item in places" @itemTap="onItemTap" row="1">
        <v-template>
          <StackLayout >
            <Label :text="item.text" />
            <Label :text="item.place_name" />
            <Label :text="item.category" />
          </StackLayout>
        </v-template>
      </ListView>
    </GridLayout>
  </Page>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ObservableArray } from "@nativescript/core/data/observable-array";

@Component
export default class App extends Vue {
  @Prop() private places: object[];


  onItemTap(event) {
    console.log(event.item.geometry.coordinates)
    this.$closeModal(this,event.item);
  }
}
</script>

<style scoped>
</style>
