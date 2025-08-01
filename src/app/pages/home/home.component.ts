import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isEmpty, uniq } from 'lodash';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { combineLatest, skipWhile, takeUntil } from 'rxjs';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { PostItemComponent } from '../../components/post-item/post-item.component';
import { OptionEntity } from '../../interfaces/option';
import { Post, PostEntity } from '../../interfaces/post';
import { TenantAppModel } from '../../interfaces/tenant-app';
import { NumberViewPipe } from '../../pipes/number-view.pipe';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { CommonService } from '../../services/common.service';
import { DestroyService } from '../../services/destroy.service';
import { MetaService } from '../../services/meta.service';
import { OptionService } from '../../services/option.service';
import { PostService } from '../../services/post.service';
import { TenantAppService } from '../../services/tenant-app.service';
import { UserAgentService } from '../../services/user-agent.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, NzButtonModule, NzIconModule, CarouselComponent, NumberViewPipe, PostItemComponent],
  providers: [DestroyService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent implements OnInit {
  isMobile = false;
  hotPosts: PostEntity[] = [];
  latestPosts: Post[] = [];
  randomPosts: PostEntity[] = [];

  protected pageIndex = 'index';

  private appInfo!: TenantAppModel;
  private options: OptionEntity = {};

  constructor(
    private readonly destroy$: DestroyService,
    private readonly userAgentService: UserAgentService,
    private readonly commonService: CommonService,
    private readonly metaService: MetaService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly tenantAppService: TenantAppService,
    private readonly optionService: OptionService,
    private readonly postService: PostService
  ) {
    this.isMobile = this.userAgentService.isMobile;
  }

  ngOnInit(): void {
    this.updatePageIndex();
    this.updateBreadcrumbs();

    combineLatest([this.tenantAppService.appInfo$, this.optionService.options$])
      .pipe(
        skipWhile(([appInfo, options]) => isEmpty(appInfo) || isEmpty(options)),
        takeUntil(this.destroy$)
      )
      .subscribe(([appInfo, options]) => {
        this.appInfo = appInfo;
        this.options = options;

        this.updatePageInfo();
        this.getLatestPosts();
        if (!this.isMobile) {
          this.getHotPosts();
          this.getRandomPosts();
        }
      });
  }

  protected updatePageIndex(): void {
    this.commonService.updatePageIndex(this.pageIndex);
  }

  private getLatestPosts() {
    this.postService
      .getPosts({
        page: 1,
        size: this.isMobile ? 10 : 8,
        sticky: 0
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.latestPosts = res.posts?.list || [];
      });
  }

  private getRandomPosts() {
    this.postService
      .getRandomPosts(8, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.randomPosts = res || [];
      });
  }

  private getHotPosts() {
    this.postService
      .getHotPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.hotPosts = res;
      });
  }

  private updatePageInfo() {
    const titles = [this.appInfo.appSlogan || '首页', this.appInfo.appName];
    const description = this.appInfo.appDescription;
    const keywords: string[] = [...this.appInfo.keywords];

    this.metaService.updateHTMLMeta({
      title: titles.join(' - '),
      description,
      keywords: uniq(keywords)
        .filter((item) => !!item)
        .join(','),
      author: this.options['site_author']
    });
  }

  private updateBreadcrumbs() {
    this.breadcrumbService.updateBreadcrumbs([]);
  }
}
