import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiderComponent } from '../../../components/sider/sider.component';
import { UserAgentService } from '../../../services/user-agent.service';

@Component({
  selector: 'app-content-layout',
  imports: [RouterOutlet, SiderComponent],
  templateUrl: './content-layout.component.html',
  styleUrl: './content-layout.component.less'
})
export class ContentLayoutComponent {
  isMobile = false;

  constructor(private readonly userAgentService: UserAgentService) {
    this.isMobile = this.userAgentService.isMobile;
  }
}
