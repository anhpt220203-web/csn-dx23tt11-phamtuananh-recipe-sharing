import {
  ChefHat,
  Image,
  Images,
  LayoutDashboard,
  Lightbulb,
  MessageCircleQuestion,
  Star,
  Tags,
  Users,
} from 'lucide-react';
import * as z from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'Quản trị',
    children: [
      {
        label: 'Tổng quan',
        path: '/admin',
        Icon: <LayoutDashboard className={iconClasses} />,
        // exact match: không highlight khi đang ở các route con như /admin/user
        highlightMatch: '^/admin$',
      },
      {
        label: 'Người dùng',
        path: '/admin/user',
        Icon: <Users className={iconClasses} />,
      },
      {
        label: 'Công thức',
        path: '/admin/cong-thuc',
        Icon: <ChefHat className={iconClasses} />,
      },
      {
        label: 'Danh mục',
        path: '/admin/danh-muc',
        Icon: <Tags className={iconClasses} />,
      },
      {
        label: 'Đánh giá',
        path: '/admin/danh-gia',
        Icon: <Star className={iconClasses} />,
      },
      {
        label: 'Hỏi đáp',
        path: '/admin/hoi-dap',
        Icon: <MessageCircleQuestion className={iconClasses} />,
      },
      {
        label: 'Banner',
        path: '/admin/banner',
        Icon: <Image className={iconClasses} />,
      },
      {
        label: 'Quản lý media',
        path: '/admin/media',
        Icon: <Images className={iconClasses} />,
      },
      {
        label: 'Mẹo vặt',
        path: '/admin/meo-vat',
        Icon: <Lightbulb className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const adminNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: 'sidebar',
});
