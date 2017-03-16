import { Component, OnInit, OnDestroy, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from "ui/page";
import { Client } from '../../common/services/api/client';
import { CacheService } from '../../common/services/cache/cache.service';


@Component({
  moduleId: 'module.id',
  selector: 'group-feed',
  templateUrl: 'feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GroupFeedComponent {

  group;
  guid;

  feed : Array<any> = [];
  offset : string = "";
  inProgress : boolean = true;
  @Output() done : EventEmitter<any> = new EventEmitter();

  constructor(private client : Client, private cache : CacheService, private cd : ChangeDetectorRef){ }

  @Input('group') set _group(group : any){

    if(!group)
      return;

    this.inProgress = true;
    this.feed = [];

    //let _feed = this.cache.get('feed:' + channel.guid);
    //if(_feed){
    //  this.feed = _feed;
    //  this.inProgress = false;
    //  return;
    //}

    this.group = group;
    this.guid = group.guid;
    this.loadList();
  }

  loadList(){
    return new Promise((resolve, reject) => {
      this.client.get('api/v1/newsfeed/container/' + this.guid, { limit: 12, offset: this.offset})
        .then((response : any) => {
          //console.log(response);
          for(let activity of response.activity){
            this.feed.push(activity);
          }

          //this.cache.set('feed:' + channel.guid, this.feed, true);
          this.inProgress = false;
          this.offset = response['load-next'];
          resolve();
          this.cd.markForCheck();
          this.cd.detectChanges();
        });
    });
  }

  @Input() set loadMore(e){
    if(!e)
      return;
    this.loadList()
      .then(() => {
        e.complete();
        this.done.next(true);
      });
  }

  refresh(e){

  }

  delete(activity) {
    let i: any;
    for(i in this.feed){
      if(this.feed[i] == activity){
        this.feed.splice(i,1);
        this.cd.markForCheck();
        this.cd.detectChanges();
      }
    }
  }

}
