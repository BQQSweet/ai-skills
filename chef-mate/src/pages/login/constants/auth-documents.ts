export type AuthDocumentKey = "agreement" | "privacy";

export interface AuthDocumentSection {
  title: string;
  paragraphs: string[];
}

export interface AuthDocumentContent {
  title: string;
  summary: string;
  updatedAt: string;
  sections: AuthDocumentSection[];
}

export const AUTH_DOCUMENTS: Record<AuthDocumentKey, AuthDocumentContent> = {
  agreement: {
    title: "ChefMate 用户协议",
    summary:
      "本协议用于说明你在使用 ChefMate 账号、家庭组、食谱生成与协作功能时的基本权利义务。",
    updatedAt: "2026-03-19",
    sections: [
      {
        title: "1. 账号使用",
        paragraphs: [
          "你应当使用本人合法持有的手机号注册和登录 ChefMate，并妥善保管验证码、密码与设备登录状态。",
          "账号仅供本人及其授权家庭成员在产品范围内使用，不得用于批量注册、接口滥用、内容爬取或其他影响平台稳定性的行为。",
        ],
      },
      {
        title: "2. 服务内容",
        paragraphs: [
          "ChefMate 提供食材管理、家庭组协作、购物清单、食谱推荐和 AI 生成等功能。部分能力依赖第三方服务，平台会在合理范围内持续优化稳定性与体验。",
          "AI 生成内容仅作为烹饪辅助建议，不应被理解为医疗、营养或食品安全领域的专业结论。",
        ],
      },
      {
        title: "3. 用户责任",
        paragraphs: [
          "你应确保填写的信息真实、准确，并在分享邀请码、上传图片、创建家庭组内容时遵守法律法规与公序良俗。",
          "若因账号外借、密码泄露或违规使用导致的损失，由账号持有人承担相应责任。",
        ],
      },
      {
        title: "4. 服务调整与终止",
        paragraphs: [
          "在法律允许范围内，ChefMate 可根据业务发展对功能、规则、接口或服务时段进行调整，并通过产品内提示、公告或更新协议的方式通知用户。",
          "如你存在严重违规、攻击系统或滥用服务的情形，平台有权限制相关功能或终止服务。",
        ],
      },
    ],
  },
  privacy: {
    title: "ChefMate 隐私保护指引",
    summary:
      "本指引说明 ChefMate 如何收集、使用、存储和保护你的个人信息，以及你可以如何管理这些信息。",
    updatedAt: "2026-03-19",
    sections: [
      {
        title: "1. 收集的信息",
        paragraphs: [
          "注册和登录时，我们会收集你的手机号、验证码校验结果及必要的账号标识信息，用于完成身份识别与账户安全控制。",
          "在你主动使用拍照识别、上传图片、加入家庭组或设置饮食偏好时，我们会收集相应的功能数据，以便提供对应服务。",
        ],
      },
      {
        title: "2. 使用目的",
        paragraphs: [
          "我们将上述信息用于账号管理、家庭组协作、食谱推荐、购物清单同步、消息通知和异常排查，不会超出产品功能范围随意扩展用途。",
          "当你调用 AI 能力时，必要的上下文数据可能会被发送至模型服务提供方，但仅限于完成当前功能所需的最小范围。",
        ],
      },
      {
        title: "3. 存储与保护",
        paragraphs: [
          "ChefMate 会采用访问控制、鉴权校验和密码哈希等措施保护你的账号信息，验证码也只在有限时效内保存。",
          "除法律法规另有要求外，我们会在实现业务目的所需的最短期限内保存你的数据，并在超出必要期限后删除或匿名化处理。",
        ],
      },
      {
        title: "4. 你的权利",
        paragraphs: [
          "你可以通过产品功能查看和修改部分个人资料，也可以通过退出登录、停止使用等方式减少新的数据处理。",
          "如你对隐私处理有疑问、建议或投诉，可通过产品后续提供的客服或反馈渠道与我们联系。",
        ],
      },
    ],
  },
};
