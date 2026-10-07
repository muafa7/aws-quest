# Content Inventory

Planning guidance for the curated question banks. Recommended counts are targets, not quotas: quality and concept coverage take priority over hitting an exact total.

- Exam scope source: [AWS Certified Cloud Practitioner (CLF-C02) exam guide](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html), in-scope and out-of-scope service lists checked on 2026-10-07.
- Counts are updated in the same commit as each content batch; refresh them from `pnpm content:validate`.

---

## CLF-C02 — AWS Certified Cloud Practitioner

### Certification

| Field | Value |
| --- | --- |
| Code | `CLF-C02` |
| Name | AWS Certified Cloud Practitioner |
| Exam format | 65 questions (50 scored, 15 unscored), 90 minutes |
| Question formats | Multiple choice: 1 correct + 3 distractors. Multiple response: 2 or more correct out of 5 or more options |
| Seed directory | `prisma/seeds/clf-c02/` |
| Question code prefix | `CCP` |
| Concept slug prefix | `clf-` |

### Summary

| Metric | Current | Planned |
| --- | --- | --- |
| Concepts | 90 | 90 |
| Lessons | 90 | 90 |
| Active questions | 415 | ~415 |

### Domains

| # | Topic slug | Name | Exam weight | Question file | Concepts (seeded / planned) | Questions (existing / recommended) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `cloud-concepts` | Cloud Concepts | 24% | `questions/cloud-concepts.json` | 18 / 18 | 83 / 83 |
| 2 | `security-compliance` | Security and Compliance | 30% | `questions/security-compliance.json` | 24 / 24 | 115 / 115 |
| 3 | `cloud-technology-services` | Cloud Technology and Services | 34% | `questions/cloud-technology-services.json` | 36 / 36 | 159 / 159 |
| 4 | `billing-pricing-support` | Billing, Pricing, and Support | 12% | `questions/billing-pricing-support.json` | 12 / 12 | 58 / 58 |
| | | **Total** | | | **90 / 90** | **415 / ~415** |

All four CLF-C02 domains are fully seeded. `questions/core.json` has been removed.

Domain 3 is above its 34% exam weight because it covers the most services. Mock exams still sample by exam weight and only need 7–22 questions per domain. The total is driven by the 4-questions-per-concept floor; going much lower would mean merging concepts and weakening their explanations.

### Concepts by domain

Column guide:

- **Status**: `seeded` = present in `concepts.json`; `planned` = not yet added.
- **Lesson**: `complete`, `weak`, `missing`, or `planned` (see [Lesson status](#lesson-status)).
- **Main styles**: the question styles the concept most needs. Every concept still gets at least one easy entry question.
- **#** is the planned `order` within the domain. Concept order is also the order new learners meet concepts in Practice, so it should read as a sensible learning path.

#### 1. Cloud Concepts (`cloud-concepts`) — 18 concepts, 83 questions

| # | Slug | Prefix | Name | Status | Lesson | Existing | Recommended | Main styles | Commonly confused with |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `clf-cloud-value-proposition` | VAL | Value Proposition of the AWS Cloud | seeded | complete | 7 | 7 | Basic, Understanding, Scenario | Economies of scale, elasticity |
| 2 | `clf-economies-of-scale` | ECO | Economies of Scale | seeded | complete | 5 | 5 | Understanding, Comparison | Value proposition, fixed vs variable costs |
| 3 | `clf-elasticity` | ELA | Elasticity | seeded | complete | 5 | 5 | Understanding, Scenario, Comparison | Scalability, high availability, auto scaling |
| 4 | `clf-high-availability` | HAV | High Availability and Fault Tolerance | seeded | complete | 5 | 5 | Understanding, Comparison, Scenario | Elasticity, Availability Zones, backup |
| 5 | `clf-well-architected-framework` | WAR | AWS Well-Architected Framework | seeded | complete | 5 | 5 | Basic, Understanding | Pillars, AWS CAF |
| 6 | `clf-wa-operational-excellence` | WOE | Well-Architected: Operational Excellence | seeded | complete | 4 | 4 | Comparison, Scenario | Reliability |
| 7 | `clf-wa-security` | WSE | Well-Architected: Security | seeded | complete | 4 | 4 | Comparison, Scenario | Reliability, operational excellence |
| 8 | `clf-wa-reliability` | WRE | Well-Architected: Reliability | seeded | complete | 4 | 4 | Comparison, Scenario | Operational excellence, performance efficiency |
| 9 | `clf-wa-performance-efficiency` | WPE | Well-Architected: Performance Efficiency | seeded | complete | 4 | 4 | Comparison, Scenario | Reliability, cost optimization |
| 10 | `clf-wa-cost-optimization` | WCO | Well-Architected: Cost Optimization | seeded | complete | 4 | 4 | Comparison, Scenario | Sustainability, performance efficiency |
| 11 | `clf-wa-sustainability` | WSU | Well-Architected: Sustainability | seeded | complete | 4 | 4 | Comparison, Scenario | Cost optimization |
| 12 | `clf-cloud-adoption-framework` | CAF | AWS Cloud Adoption Framework (AWS CAF) | seeded | complete | 5 | 5 | Basic, Comparison | Well-Architected Framework, migration strategies |
| 13 | `clf-migration-strategies` | MIG | Migration Strategies (7 Rs) | seeded | complete | 5 | 5 | Comparison, Scenario | Migration services, AWS CAF |
| 14 | `clf-migration-services` | MGS | Migration Services (AWS Transform MGN, Application Discovery Service, Migration Hub, Migration Evaluator) | seeded | complete | 5 | 5 | Basic, Scenario | Database migration (AWS DMS, AWS SCT) |
| 15 | `clf-fixed-vs-variable-costs` | CPX | Fixed vs Variable Costs | seeded | complete | 5 | 5 | Understanding, Comparison, Scenario | Economies of scale |
| 16 | `clf-licensing-strategies` | LIC | Licensing Strategies (BYOL vs License Included, License Manager) | seeded | complete | 4 | 4 | Understanding, Scenario | Dedicated Hosts |
| 17 | `clf-rightsizing` | RSZ | Rightsizing (Compute Optimizer) | seeded | complete | 4 | 4 | Understanding, Scenario | Elasticity, Trusted Advisor |
| 18 | `clf-automation-benefits` | AUT | Benefits of Automation | seeded | complete | 4 | 4 | Understanding, Scenario | Infrastructure as code |

#### 2. Security and Compliance (`security-compliance`) — 24 concepts, 115 questions

| # | Slug | Prefix | Name | Status | Lesson | Existing | Recommended | Main styles | Commonly confused with |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `clf-shared-responsibility` | SRM | Shared Responsibility Model | seeded | complete | 8 | 8 | Scenario, Understanding, Comparison | How responsibility shifts across EC2, RDS, Lambda, S3 |
| 2 | `clf-iam-users-groups-policies` | IAM | IAM Users, Groups, and Policies (least privilege, managed vs custom policies, access reports) | seeded | complete | 7 | 7 | Basic, Understanding, Scenario | IAM roles, IAM Identity Center |
| 3 | `clf-iam-roles` | ROL | IAM Roles (including cross-account roles) | seeded | complete | 5 | 5 | Scenario, Comparison | IAM users, access keys |
| 4 | `clf-root-user` | ROO | AWS Account Root User | seeded | complete | 5 | 5 | Understanding, Scenario | IAM users |
| 5 | `clf-mfa-credentials` | MFA | MFA, Password Policies, and Access Keys | seeded | complete | 4 | 4 | Basic, Understanding | Root user, credential storage |
| 6 | `clf-iam-identity-center` | IDC | AWS IAM Identity Center (federation) | seeded | complete | 4 | 4 | Scenario, Comparison | Amazon Cognito, IAM users |
| 7 | `clf-cognito` | COG | Amazon Cognito | seeded | complete | 4 | 4 | Scenario, Comparison | IAM Identity Center |
| 8 | `clf-multi-account-governance` | GOV | Multi-Account Governance (Organizations SCPs, Control Tower, Service Catalog, RAM) | seeded | complete | 5 | 5 | Understanding, Scenario | IAM policies, consolidated billing |
| 9 | `clf-secrets-management` | SMG | Credential Storage (Secrets Manager, Systems Manager Parameter Store) | seeded | complete | 4 | 4 | Comparison, Scenario | AWS KMS |
| 10 | `clf-encryption-kms` | KMS | Encryption and Key Management (KMS, CloudHSM, ACM) | seeded | complete | 5 | 5 | Understanding, Comparison | Credential storage |
| 11 | `clf-security-groups` | SGR | Security Groups | seeded | complete | 5 | 5 | Understanding, Comparison | Network ACLs |
| 12 | `clf-network-acls` | NAC | Network ACLs | seeded | complete | 4 | 4 | Understanding, Comparison | Security groups |
| 13 | `clf-shield` | SHD | AWS Shield | seeded | complete | 5 | 5 | Basic, Comparison | AWS WAF |
| 14 | `clf-aws-waf` | WAF | AWS WAF and AWS Firewall Manager | seeded | complete | 5 | 5 | Basic, Comparison, Scenario | AWS Shield, security groups |
| 15 | `clf-guardduty` | GDY | Amazon GuardDuty | seeded | complete | 5 | 5 | Basic, Comparison | Inspector, Detective, Macie |
| 16 | `clf-inspector` | INS | Amazon Inspector | seeded | complete | 4 | 4 | Basic, Comparison | GuardDuty |
| 17 | `clf-macie` | MAC | Amazon Macie | seeded | complete | 4 | 4 | Basic, Comparison | GuardDuty |
| 18 | `clf-detective` | DET | Amazon Detective | seeded | complete | 4 | 4 | Comparison | GuardDuty, Security Hub |
| 19 | `clf-security-hub` | SHB | AWS Security Hub CSPM | seeded | complete | 4 | 4 | Understanding, Comparison | GuardDuty, Trusted Advisor |
| 20 | `clf-cloudtrail` | CTR | AWS CloudTrail | seeded | complete | 5 | 5 | Basic, Comparison, Scenario | CloudWatch, AWS Config |
| 21 | `clf-cloudwatch` | CWT | Amazon CloudWatch | seeded | complete | 5 | 5 | Basic, Comparison, Scenario | CloudTrail |
| 22 | `clf-aws-config` | CFG | AWS Config | seeded | complete | 5 | 5 | Understanding, Comparison | CloudTrail |
| 23 | `clf-compliance-artifact` | ART | AWS Compliance and AWS Artifact | seeded | complete | 5 | 5 | Basic, Scenario | AWS Config, security resources |
| 24 | `clf-security-resources` | SRS | Security Resources and Third-Party Products (Marketplace, re:Post Knowledge Center, Security Center, Security Blog) | seeded | complete | 4 | 4 | Basic | Technical resources, AWS Marketplace |

#### 3. Cloud Technology and Services (`cloud-technology-services`) — 36 concepts, 159 questions

| # | Slug | Prefix | Name | Status | Lesson | Existing | Recommended | Main styles | Commonly confused with |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `clf-aws-access-methods` | ACC | Ways to Access AWS (Console, CLI, SDKs, APIs) | seeded | complete | 4 | 4 | Basic, Comparison | Infrastructure as code |
| 2 | `clf-infrastructure-as-code` | IAC | Infrastructure as Code (AWS CloudFormation) | seeded | complete | 5 | 5 | Understanding, Comparison | Elastic Beanstalk, access methods |
| 3 | `clf-deployment-models` | DPM | Cloud Deployment Models (cloud, hybrid, on-premises, Outposts) | seeded | complete | 4 | 4 | Comparison, Scenario | Hybrid connectivity |
| 4 | `clf-regions` | REG | AWS Regions | seeded | complete | 5 | 5 | Understanding, Scenario | Availability Zones, edge locations |
| 5 | `clf-availability-zones` | AZS | Availability Zones | seeded | complete | 4 | 4 | Understanding, Comparison | Regions, high availability |
| 6 | `clf-edge-locations` | EDG | Edge Locations and AWS Global Accelerator | seeded | complete | 4 | 4 | Comparison | CloudFront, Regions |
| 7 | `clf-ec2` | EC2 | Amazon EC2 and Instance Types | seeded | complete | 5 | 5 | Basic, Understanding, Scenario | Lambda, Lightsail |
| 8 | `clf-auto-scaling` | ASG | Auto Scaling | seeded | complete | 4 | 4 | Understanding, Scenario | Elastic Load Balancing, elasticity |
| 9 | `clf-elastic-load-balancing` | ELB | Elastic Load Balancing | seeded | complete | 4 | 4 | Understanding, Scenario | Auto Scaling, Route 53 |
| 10 | `clf-lambda` | LAM | AWS Lambda and Serverless APIs (API Gateway) | seeded | complete | 5 | 5 | Basic, Comparison, Scenario | EC2, Fargate |
| 11 | `clf-containers` | CON | Containers (ECS, EKS, Fargate, ECR) | seeded | complete | 5 | 5 | Comparison, Scenario | Lambda |
| 12 | `clf-managed-compute-options` | MCO | Managed Compute Options (Elastic Beanstalk, Lightsail, Batch) | seeded | complete | 4 | 4 | Comparison, Scenario | CloudFormation, EC2 |
| 13 | `clf-rds-aurora` | RDS | Amazon RDS and Amazon Aurora (managed vs EC2-hosted databases) | seeded | complete | 5 | 5 | Basic, Comparison, Scenario | DynamoDB |
| 14 | `clf-dynamodb` | DDB | Amazon DynamoDB | seeded | complete | 5 | 5 | Comparison, Scenario | RDS |
| 15 | `clf-other-databases` | DBO | Other Purpose-Built Databases (ElastiCache: Valkey, Memcached, Redis OSS; DocumentDB; Neptune) | seeded | complete | 4 | 4 | Basic, Comparison | DynamoDB, RDS |
| 16 | `clf-database-migration` | DMS | Database Migration (AWS DMS, DMS Schema Conversion, AWS SCT) | seeded | complete | 4 | 4 | Scenario | Migration services |
| 17 | `clf-vpc` | VPC | Amazon VPC (subnets, gateways, PrivateLink, Transit Gateway) | seeded | complete | 5 | 5 | Understanding, Comparison | Security groups, network ACLs |
| 18 | `clf-route-53` | R53 | Amazon Route 53 | seeded | complete | 4 | 4 | Basic, Understanding | CloudFront, Elastic Load Balancing |
| 19 | `clf-cloudfront` | CFR | Amazon CloudFront | seeded | complete | 4 | 4 | Basic, Comparison, Scenario | Global Accelerator, S3 |
| 20 | `clf-hybrid-connectivity` | HYB | Hybrid Connectivity (AWS VPN, AWS Direct Connect) | seeded | complete | 5 | 5 | Comparison, Scenario | Deployment models |
| 21 | `clf-s3` | S3B | Amazon S3 | seeded | complete | 5 | 5 | Basic, Understanding, Scenario | EBS, EFS |
| 22 | `clf-s3-storage-classes` | S3C | Amazon S3 Storage Classes and Lifecycle Policies | seeded | complete | 5 | 5 | Comparison, Scenario | AWS Backup |
| 23 | `clf-ebs-instance-store` | EBS | Block Storage (Amazon EBS, Instance Store) | seeded | complete | 5 | 5 | Comparison, Scenario | S3, EFS |
| 24 | `clf-efs-fsx` | EFS | File Storage (Amazon EFS, Amazon FSx) | seeded | complete | 4 | 4 | Comparison, Scenario | EBS, S3 |
| 25 | `clf-storage-gateway` | SGW | AWS Storage Gateway (S3 File Gateway, Volume Gateway, Tape Gateway) | seeded | complete | 4 | 4 | Scenario | Hybrid connectivity, S3 |
| 26 | `clf-aws-backup` | BKP | AWS Backup and AWS Elastic Disaster Recovery | seeded | complete | 4 | 4 | Understanding, Scenario | S3 lifecycle policies |
| 27 | `clf-sagemaker` | SGM | Amazon SageMaker AI | seeded | complete | 4 | 4 | Basic, Comparison | AI services |
| 28 | `clf-ai-language-services` | AIL | AI Language and Assistant Services (Comprehend, Lex, Polly, Transcribe, Translate, Amazon Q Developer) | seeded | complete | 5 | 5 | Basic, Comparison | SageMaker AI, vision services |
| 29 | `clf-ai-vision-document-services` | AIV | AI Vision and Document Services (Rekognition, Textract) | seeded | complete | 4 | 4 | Basic, Comparison | Language services |
| 30 | `clf-analytics-services` | ANA | Analytics Services (Athena, Redshift, EMR, Glue) | seeded | complete | 5 | 5 | Basic, Comparison | RDS, streaming services |
| 31 | `clf-streaming-search-bi` | SBI | Streaming, Search, and BI (Kinesis, OpenSearch Service, Amazon Quick Sight) | seeded | complete | 4 | 4 | Basic, Comparison | Analytics services, SQS |
| 32 | `clf-application-integration` | INT | Application Integration (SNS, SQS, EventBridge, Step Functions) | seeded | complete | 5 | 5 | Comparison, Scenario | Kinesis |
| 33 | `clf-systems-manager` | SSM | AWS Systems Manager | seeded | complete | 4 | 4 | Understanding, Scenario | Secrets Manager, CloudWatch |
| 34 | `clf-developer-tools` | DEV | Developer Tools (CodeBuild, CodePipeline, X-Ray) | seeded | complete | 4 | 4 | Basic | CloudFormation |
| 35 | `clf-end-user-computing` | EUC | End-User Computing (WorkSpaces, WorkSpaces Applications / AppStream 2.0, WorkSpaces Secure Browser) | seeded | complete | 4 | 4 | Basic, Comparison | EC2 |
| 36 | `clf-other-in-scope-services` | OTH | Business, Frontend, and IoT Services (Connect, SES, Amplify, IoT Core) | seeded | complete | 4 | 4 | Basic | SNS |

#### 4. Billing, Pricing, and Support (`billing-pricing-support`) — 12 concepts, 58 questions

| # | Slug | Prefix | Name | Status | Lesson | Existing | Recommended | Main styles | Commonly confused with |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `clf-on-demand-spot` | ODS | On-Demand and Spot Instances | seeded | complete | 5 | 5 | Comparison, Scenario | Reserved Instances, Savings Plans |
| 2 | `clf-reserved-savings-plans` | RSP | Reserved Instances, Savings Plans, and Capacity Reservations | seeded | complete | 6 | 6 | Comparison, Scenario | On-Demand, Spot |
| 3 | `clf-dedicated-hosts-instances` | DED | Dedicated Hosts and Dedicated Instances | seeded | complete | 4 | 4 | Comparison, Scenario | Licensing strategies |
| 4 | `clf-data-transfer-costs` | DTC | Data Transfer Costs | seeded | complete | 4 | 4 | Understanding, Scenario | CloudFront |
| 5 | `clf-cost-management-tools` | CMT | Cost Management Tools (Budgets, Cost Explorer, Pricing Calculator, CUR 2.0 / Data Exports) | seeded | complete | 6 | 6 | Comparison, Scenario | Trusted Advisor |
| 6 | `clf-consolidated-billing` | CBL | AWS Organizations Consolidated Billing | seeded | complete | 5 | 5 | Understanding, Scenario | Multi-account governance |
| 7 | `clf-cost-allocation-tags` | TAG | Cost Allocation Tags | seeded | complete | 4 | 4 | Understanding, Scenario | Cost management tools |
| 8 | `clf-support-plans` | SUP | AWS Support Plans (Basic, Business Support+, Enterprise Support, Unified Operations) | seeded | complete | 6 | 6 | Comparison, Scenario | Technical resources |
| 9 | `clf-trusted-advisor` | TAD | AWS Trusted Advisor (including Service Quotas) | seeded | complete | 5 | 5 | Basic, Comparison, Scenario | Health Dashboard, Security Hub, Compute Optimizer |
| 10 | `clf-health-dashboard` | HLT | AWS Health Dashboard and AWS Health API | seeded | complete | 4 | 4 | Comparison | Trusted Advisor, CloudWatch |
| 11 | `clf-technical-resources` | RES | AWS Technical Resources (documentation, whitepapers, re:Post Knowledge Center, Prescriptive Guidance, Support Center, Trust and Safety) | seeded | complete | 4 | 4 | Basic | Support plans |
| 12 | `clf-partners-marketplace` | APN | AWS Partners, Marketplace, Professional Services, and Solutions Architects | seeded | complete | 5 | 5 | Basic, Comparison | Support plans |

Storage pricing tiers (exam task 4.1) are owned by `clf-s3-storage-classes` in domain 3.

### Lesson status

| Status | Meaning |
| --- | --- |
| `complete` | Summary, at least 3 key points, concept `keyNote` and `referenceUrl`, and the explanation covers every angle its questions test, including the contrast for comparison questions. |
| `weak` | Lesson exists but does not yet cover some angle its planned questions need. |
| `missing` | Active concept without a lesson. Learn returns 404 for it, so it must not ship. |
| `planned` | Concept not yet in `concepts.json`. |

Current weak lessons: none. The shared-responsibility explanation now covers how responsibility shifts across EC2, RDS, Lambda, and S3.

### Existing questions

| Codes | Concept | Count | File |
| --- | --- | --- | --- |
| `CCP-VAL-001`–`007` | `clf-cloud-value-proposition` | 7 | `questions/cloud-concepts.json` |
| `CCP-ECO-001`–`005` | `clf-economies-of-scale` | 5 | `questions/cloud-concepts.json` |
| `CCP-ELA-001`–`005` | `clf-elasticity` | 5 | `questions/cloud-concepts.json` |
| `CCP-HAV-001`–`005` | `clf-high-availability` | 5 | `questions/cloud-concepts.json` |
| `CCP-WAR-001`–`005` | `clf-well-architected-framework` | 5 | `questions/cloud-concepts.json` |
| `CCP-WOE-001`–`004` | `clf-wa-operational-excellence` | 4 | `questions/cloud-concepts.json` |
| `CCP-WSE-001`–`004` | `clf-wa-security` | 4 | `questions/cloud-concepts.json` |
| `CCP-WRE-001`–`004` | `clf-wa-reliability` | 4 | `questions/cloud-concepts.json` |
| `CCP-WPE-001`–`004` | `clf-wa-performance-efficiency` | 4 | `questions/cloud-concepts.json` |
| `CCP-WCO-001`–`004` | `clf-wa-cost-optimization` | 4 | `questions/cloud-concepts.json` |
| `CCP-WSU-001`–`004` | `clf-wa-sustainability` | 4 | `questions/cloud-concepts.json` |
| `CCP-CAF-001`–`005` | `clf-cloud-adoption-framework` | 5 | `questions/cloud-concepts.json` |
| `CCP-MIG-001`–`005` | `clf-migration-strategies` | 5 | `questions/cloud-concepts.json` |
| `CCP-MGS-001`–`005` | `clf-migration-services` | 5 | `questions/cloud-concepts.json` |
| `CCP-CPX-001`–`005` | `clf-fixed-vs-variable-costs` | 5 | `questions/cloud-concepts.json` |
| `CCP-LIC-001`–`004` | `clf-licensing-strategies` | 4 | `questions/cloud-concepts.json` |
| `CCP-RSZ-001`–`004` | `clf-rightsizing` | 4 | `questions/cloud-concepts.json` |
| `CCP-AUT-001`–`004` | `clf-automation-benefits` | 4 | `questions/cloud-concepts.json` |
| `CCP-SRM-001`–`008` | `clf-shared-responsibility` | 8 | `questions/security-compliance.json` |
| `CCP-IAM-001`–`007` | `clf-iam-users-groups-policies` | 7 | `questions/security-compliance.json` |
| `CCP-ROL-001`–`005` | `clf-iam-roles` | 5 | `questions/security-compliance.json` |
| `CCP-ROO-001`–`005` | `clf-root-user` | 5 | `questions/security-compliance.json` |
| `CCP-MFA-001`–`004` | `clf-mfa-credentials` | 4 | `questions/security-compliance.json` |
| `CCP-IDC-001`–`004` | `clf-iam-identity-center` | 4 | `questions/security-compliance.json` |
| `CCP-COG-001`–`004` | `clf-cognito` | 4 | `questions/security-compliance.json` |
| `CCP-GOV-001`–`005` | `clf-multi-account-governance` | 5 | `questions/security-compliance.json` |
| `CCP-SMG-001`–`004` | `clf-secrets-management` | 4 | `questions/security-compliance.json` |
| `CCP-KMS-001`–`005` | `clf-encryption-kms` | 5 | `questions/security-compliance.json` |
| `CCP-SGR-001`–`005` | `clf-security-groups` | 5 | `questions/security-compliance.json` |
| `CCP-NAC-001`–`004` | `clf-network-acls` | 4 | `questions/security-compliance.json` |
| `CCP-SHD-001`–`005` | `clf-shield` | 5 | `questions/security-compliance.json` |
| `CCP-WAF-001`–`005` | `clf-aws-waf` | 5 | `questions/security-compliance.json` |
| `CCP-GDY-001`–`005` | `clf-guardduty` | 5 | `questions/security-compliance.json` |
| `CCP-INS-001`–`004` | `clf-inspector` | 4 | `questions/security-compliance.json` |
| `CCP-MAC-001`–`004` | `clf-macie` | 4 | `questions/security-compliance.json` |
| `CCP-DET-001`–`004` | `clf-detective` | 4 | `questions/security-compliance.json` |
| `CCP-SHB-001`–`004` | `clf-security-hub` | 4 | `questions/security-compliance.json` |
| `CCP-CTR-001`–`005` | `clf-cloudtrail` | 5 | `questions/security-compliance.json` |
| `CCP-CWT-001`–`005` | `clf-cloudwatch` | 5 | `questions/security-compliance.json` |
| `CCP-CFG-001`–`005` | `clf-aws-config` | 5 | `questions/security-compliance.json` |
| `CCP-ART-001`–`005` | `clf-compliance-artifact` | 5 | `questions/security-compliance.json` |
| `CCP-SRS-001`–`004` | `clf-security-resources` | 4 | `questions/security-compliance.json` |
| `CCP-ACC-001`–`004` | `clf-aws-access-methods` | 4 | `questions/cloud-technology-services.json` |
| `CCP-IAC-001`–`005` | `clf-infrastructure-as-code` | 5 | `questions/cloud-technology-services.json` |
| `CCP-DPM-001`–`004` | `clf-deployment-models` | 4 | `questions/cloud-technology-services.json` |
| `CCP-REG-001`–`005` | `clf-regions` | 5 | `questions/cloud-technology-services.json` |
| `CCP-AZS-001`–`004` | `clf-availability-zones` | 4 | `questions/cloud-technology-services.json` |
| `CCP-EDG-001`–`004` | `clf-edge-locations` | 4 | `questions/cloud-technology-services.json` |
| `CCP-EC2-001`–`005` | `clf-ec2` | 5 | `questions/cloud-technology-services.json` |
| `CCP-ASG-001`–`004` | `clf-auto-scaling` | 4 | `questions/cloud-technology-services.json` |
| `CCP-ELB-001`–`004` | `clf-elastic-load-balancing` | 4 | `questions/cloud-technology-services.json` |
| `CCP-LAM-001`–`005` | `clf-lambda` | 5 | `questions/cloud-technology-services.json` |
| `CCP-CON-001`–`005` | `clf-containers` | 5 | `questions/cloud-technology-services.json` |
| `CCP-MCO-001`–`004` | `clf-managed-compute-options` | 4 | `questions/cloud-technology-services.json` |
| `CCP-RDS-001`–`005` | `clf-rds-aurora` | 5 | `questions/cloud-technology-services.json` |
| `CCP-DDB-001`–`005` | `clf-dynamodb` | 5 | `questions/cloud-technology-services.json` |
| `CCP-DBO-001`–`004` | `clf-other-databases` | 4 | `questions/cloud-technology-services.json` |
| `CCP-DMS-001`–`004` | `clf-database-migration` | 4 | `questions/cloud-technology-services.json` |
| `CCP-VPC-001`–`005` | `clf-vpc` | 5 | `questions/cloud-technology-services.json` |
| `CCP-R53-001`–`004` | `clf-route-53` | 4 | `questions/cloud-technology-services.json` |
| `CCP-CFR-001`–`004` | `clf-cloudfront` | 4 | `questions/cloud-technology-services.json` |
| `CCP-HYB-001`–`005` | `clf-hybrid-connectivity` | 5 | `questions/cloud-technology-services.json` |
| `CCP-S3B-001`–`005` | `clf-s3` | 5 | `questions/cloud-technology-services.json` |
| `CCP-S3C-001`–`005` | `clf-s3-storage-classes` | 5 | `questions/cloud-technology-services.json` |
| `CCP-EBS-001`–`005` | `clf-ebs-instance-store` | 5 | `questions/cloud-technology-services.json` |
| `CCP-EFS-001`–`004` | `clf-efs-fsx` | 4 | `questions/cloud-technology-services.json` |
| `CCP-SGW-001`–`004` | `clf-storage-gateway` | 4 | `questions/cloud-technology-services.json` |
| `CCP-BKP-001`–`004` | `clf-aws-backup` | 4 | `questions/cloud-technology-services.json` |
| `CCP-SGM-001`–`004` | `clf-sagemaker` | 4 | `questions/cloud-technology-services.json` |
| `CCP-AIL-001`–`005` | `clf-ai-language-services` | 5 | `questions/cloud-technology-services.json` |
| `CCP-AIV-001`–`004` | `clf-ai-vision-document-services` | 4 | `questions/cloud-technology-services.json` |
| `CCP-ANA-001`–`005` | `clf-analytics-services` | 5 | `questions/cloud-technology-services.json` |
| `CCP-SBI-001`–`004` | `clf-streaming-search-bi` | 4 | `questions/cloud-technology-services.json` |
| `CCP-INT-001`–`005` | `clf-application-integration` | 5 | `questions/cloud-technology-services.json` |
| `CCP-SSM-001`–`004` | `clf-systems-manager` | 4 | `questions/cloud-technology-services.json` |
| `CCP-DEV-001`–`004` | `clf-developer-tools` | 4 | `questions/cloud-technology-services.json` |
| `CCP-EUC-001`–`004` | `clf-end-user-computing` | 4 | `questions/cloud-technology-services.json` |
| `CCP-OTH-001`–`004` | `clf-other-in-scope-services` | 4 | `questions/cloud-technology-services.json` |
| `CCP-ODS-001`–`005` | `clf-on-demand-spot` | 5 | `questions/billing-pricing-support.json` |
| `CCP-RSP-001`–`006` | `clf-reserved-savings-plans` | 6 | `questions/billing-pricing-support.json` |
| `CCP-DED-001`–`004` | `clf-dedicated-hosts-instances` | 4 | `questions/billing-pricing-support.json` |
| `CCP-DTC-001`–`004` | `clf-data-transfer-costs` | 4 | `questions/billing-pricing-support.json` |
| `CCP-CMT-001`–`006` | `clf-cost-management-tools` | 6 | `questions/billing-pricing-support.json` |
| `CCP-CBL-001`–`005` | `clf-consolidated-billing` | 5 | `questions/billing-pricing-support.json` |
| `CCP-TAG-001`–`004` | `clf-cost-allocation-tags` | 4 | `questions/billing-pricing-support.json` |
| `CCP-SUP-001`–`006` | `clf-support-plans` | 6 | `questions/billing-pricing-support.json` |
| `CCP-TAD-001`–`005` | `clf-trusted-advisor` | 5 | `questions/billing-pricing-support.json` |
| `CCP-HLT-001`–`004` | `clf-health-dashboard` | 4 | `questions/billing-pricing-support.json` |
| `CCP-RES-001`–`004` | `clf-technical-resources` | 4 | `questions/billing-pricing-support.json` |
| `CCP-APN-001`–`005` | `clf-partners-marketplace` | 5 | `questions/billing-pricing-support.json` |

`CCP-ELA-001` through `CCP-ELA-003` and `CCP-SRM-001` through `CCP-SRM-003` keep their original codes.

Next free codes: `CCP-VAL-008`, `CCP-ECO-006`, `CCP-ELA-006`, `CCP-HAV-006`, `CCP-WAR-006`, `CCP-WOE-005`, `CCP-WSE-005`, `CCP-WRE-005`, `CCP-WPE-005`, `CCP-WCO-005`, `CCP-WSU-005`, `CCP-CAF-006`, `CCP-MIG-006`, `CCP-MGS-006`, `CCP-CPX-006`, `CCP-LIC-005`, `CCP-RSZ-005`, `CCP-AUT-005`, `CCP-SRM-009`, `CCP-IAM-008`, `CCP-ROL-006`, `CCP-ROO-006`, `CCP-MFA-005`, `CCP-IDC-005`, `CCP-COG-005`, `CCP-GOV-006`, `CCP-SMG-005`, `CCP-KMS-006`, `CCP-SGR-006`, `CCP-NAC-005`, `CCP-SHD-006`, `CCP-WAF-006`, `CCP-GDY-006`, `CCP-INS-005`, `CCP-MAC-005`, `CCP-DET-005`, `CCP-SHB-005`, `CCP-CTR-006`, `CCP-CWT-006`, `CCP-CFG-006`, `CCP-ART-006`, `CCP-SRS-005`, `CCP-ACC-005`, `CCP-IAC-006`, `CCP-DPM-005`, `CCP-REG-006`, `CCP-AZS-005`, `CCP-EDG-005`, `CCP-EC2-006`, `CCP-ASG-005`, `CCP-ELB-005`, `CCP-LAM-006`, `CCP-CON-006`, `CCP-MCO-005`, `CCP-RDS-006`, `CCP-DDB-006`, `CCP-DBO-005`, `CCP-DMS-005`, `CCP-VPC-006`, `CCP-R53-005`, `CCP-CFR-005`, `CCP-HYB-006`, `CCP-S3B-006`, `CCP-S3C-006`, `CCP-EBS-006`, `CCP-EFS-005`, `CCP-SGW-005`, `CCP-BKP-005`, `CCP-SGM-005`, `CCP-AIL-006`, `CCP-AIV-005`, `CCP-ANA-006`, `CCP-SBI-005`, `CCP-INT-006`, `CCP-SSM-005`, `CCP-DEV-005`, `CCP-EUC-005`, `CCP-OTH-005`, `CCP-ODS-006`, `CCP-RSP-007`, `CCP-DED-005`, `CCP-DTC-005`, `CCP-CMT-007`, `CCP-CBL-006`, `CCP-TAG-005`, `CCP-SUP-007`, `CCP-TAD-006`, `CCP-HLT-005`, `CCP-RES-005`, `CCP-APN-006`. Every planned CLF-C02 prefix is now in use.

Relabelling style or difficulty keeps the same code (spec section 28).

### Distribution targets

| Dimension | Current (415) | Target |
| --- | --- | --- |
| Style | BASIC 94, UNDERSTANDING 124, COMPARISON 91, SCENARIO 106, ARCHITECTURE 0 | BASIC ~25%, UNDERSTANDING ~30%, COMPARISON ~22%, SCENARIO ~23%, ARCHITECTURE 0–2% |
| Difficulty | EASY 161, MEDIUM 186, HARD 68 | EASY ~40%, MEDIUM ~45%, HARD ~15% |
| Type | SINGLE_CHOICE 362, MULTIPLE_CHOICE 53 | MULTIPLE_CHOICE 10–15% |
| Correct-answer position | A 111, B 110, C 111, D 107, E 29 | Roughly 20–30% per letter (informational) |

The exam guide lists "Designing cloud architecture" as out of scope for the CLF-C02 candidate, so ARCHITECTURE questions should be rare or absent.

### Question code convention

```text
CCP-<PREFIX>-<NNN>
```

- `CCP` is the CLF-C02 certification prefix. SAA-C03 uses `SAA`.
- `<PREFIX>` is 2–5 uppercase letters or digits, registered per concept in the tables above. One prefix belongs to exactly one concept.
- `<NNN>` is a 3-digit sequence per prefix, starting at `001`.
- Numbering is serving order: Learn and Practice show the lowest unseen code first, so `001` should be the easy entry question.
- Never rename or reuse a code. Retire a question with `"active": false` instead of deleting it.
- Create a new code when the tested concept, the correct answer, or the scenario changes materially. Wording, style and difficulty fixes keep the code.

### Concept slug convention

```text
clf-<kebab-case-name>
```

- The `clf-` prefix is required because concept slugs are unique across all certifications in the database.
- Slugs are permanent. Renaming a slug creates a new concept and orphans existing progress.

Valid concept slugs today (only these may be referenced by questions and lessons):

- `clf-cloud-value-proposition`
- `clf-economies-of-scale`
- `clf-elasticity`
- `clf-high-availability`
- `clf-well-architected-framework`
- `clf-wa-operational-excellence`
- `clf-wa-security`
- `clf-wa-reliability`
- `clf-wa-performance-efficiency`
- `clf-wa-cost-optimization`
- `clf-wa-sustainability`
- `clf-cloud-adoption-framework`
- `clf-migration-strategies`
- `clf-migration-services`
- `clf-fixed-vs-variable-costs`
- `clf-licensing-strategies`
- `clf-rightsizing`
- `clf-automation-benefits`
- `clf-shared-responsibility`
- `clf-iam-users-groups-policies`
- `clf-iam-roles`
- `clf-root-user`
- `clf-mfa-credentials`
- `clf-iam-identity-center`
- `clf-cognito`
- `clf-multi-account-governance`
- `clf-secrets-management`
- `clf-encryption-kms`
- `clf-security-groups`
- `clf-network-acls`
- `clf-shield`
- `clf-aws-waf`
- `clf-guardduty`
- `clf-inspector`
- `clf-macie`
- `clf-detective`
- `clf-security-hub`
- `clf-cloudtrail`
- `clf-cloudwatch`
- `clf-aws-config`
- `clf-compliance-artifact`
- `clf-security-resources`
- `clf-aws-access-methods`
- `clf-infrastructure-as-code`
- `clf-deployment-models`
- `clf-regions`
- `clf-availability-zones`
- `clf-edge-locations`
- `clf-ec2`
- `clf-auto-scaling`
- `clf-elastic-load-balancing`
- `clf-lambda`
- `clf-containers`
- `clf-managed-compute-options`
- `clf-rds-aurora`
- `clf-dynamodb`
- `clf-other-databases`
- `clf-database-migration`
- `clf-vpc`
- `clf-route-53`
- `clf-cloudfront`
- `clf-hybrid-connectivity`
- `clf-s3`
- `clf-s3-storage-classes`
- `clf-ebs-instance-store`
- `clf-efs-fsx`
- `clf-storage-gateway`
- `clf-aws-backup`
- `clf-sagemaker`
- `clf-ai-language-services`
- `clf-ai-vision-document-services`
- `clf-analytics-services`
- `clf-streaming-search-bi`
- `clf-application-integration`
- `clf-systems-manager`
- `clf-developer-tools`
- `clf-end-user-computing`
- `clf-other-in-scope-services`
- `clf-on-demand-spot`
- `clf-reserved-savings-plans`
- `clf-dedicated-hosts-instances`
- `clf-data-transfer-costs`
- `clf-cost-management-tools`
- `clf-consolidated-billing`
- `clf-cost-allocation-tags`
- `clf-support-plans`
- `clf-trusted-advisor`
- `clf-health-dashboard`
- `clf-technical-resources`
- `clf-partners-marketplace`

Planned slugs in the tables above become valid once they are added to `concepts.json` together with their lessons.

### JSON structures

Question (`questions/<topic-slug>.json`, an array of these; example only, not seeded):

```json
{
  "code": "CCP-SRM-009",
  "concept": "clf-shared-responsibility",
  "type": "SINGLE_CHOICE",
  "difficulty": "MEDIUM",
  "style": "SCENARIO",
  "question": "A company migrates its database to Amazon RDS. Which task does AWS manage?",
  "options": [
    { "key": "A", "text": "Creating database user accounts", "correct": false },
    { "key": "B", "text": "Patching the database engine and underlying operating system", "correct": true },
    { "key": "C", "text": "Configuring security group rules for the database", "correct": false },
    { "key": "D", "text": "Deciding which data must be encrypted", "correct": false }
  ],
  "tags": ["rds", "shared-responsibility"],
  "source": {
    "title": "AWS Shared Responsibility Model",
    "url": "https://aws.amazon.com/compliance/shared-responsibility-model/"
  },
  "active": true
}
```

| Field | Rule |
| --- | --- |
| `code` | Required. Follows the code convention above. |
| `concept` | Required. A valid concept slug. Certification comes from the directory and domain comes from the concept's `topic`, so questions have no `certification` or `domain` field. |
| `type` | `SINGLE_CHOICE` (exactly 1 correct, 4 options) or `MULTIPLE_CHOICE` (2 or more correct, 5 or more options). |
| `difficulty` | `EASY`, `MEDIUM`, `HARD`. Describes cognitive difficulty, not length. |
| `style` | `BASIC`, `UNDERSTANDING`, `COMPARISON`, `SCENARIO`, `ARCHITECTURE`. |
| `question` | English. MULTIPLE_CHOICE prompts end with `(Select TWO.)`, `(Select THREE.)`, etc., matching the number of correct options. |
| `options` | Keys `A`, `B`, `C`, ... in display order. English. |
| `tags` | Optional, lowercase kebab-case, no duplicates. |
| `source` | Recommended. Official AWS documentation the answer can be checked against. |
| `active` | Optional, defaults to `true`. |

Concept (`concepts.json`):

```json
{
  "topic": "security-compliance",
  "slug": "clf-shared-responsibility",
  "name": "Shared Responsibility Model",
  "generalExplanation": "Bahasa Indonesia. Shown as feedback for every question in this concept, so it must cover every angle those questions test.",
  "keyNote": "Bahasa Indonesia, one line.",
  "referenceUrl": "https://aws.amazon.com/compliance/shared-responsibility-model/",
  "order": 1,
  "active": true
}
```

Lesson (`lessons.json`, exactly one per concept):

```json
{
  "concept": "clf-shared-responsibility",
  "title": "Shared Responsibility Model",
  "summary": "Bahasa Indonesia, 1–2 sentences.",
  "keyPoints": ["Bahasa Indonesia", "3 to 5 short points"],
  "order": 1
}
```

### Authoring rules for this bank

1. Add a concept, its lesson and its questions in the same commit. Every active concept needs a lesson.
2. Write at least 4 active questions per concept. Mastery needs 3 distinct questions; the fourth leaves an unseen question for review.
3. Start each concept with an easy entry question (`001`), then build towards comparison and scenario questions.
4. Practice shows the concept name above the question. Prefer recognition questions that name the service and ask what it does ("What does Amazon GuardDuty do?") over questions whose answer is the concept's own name.
5. A comparison question belongs to the concept that is its correct answer. That concept's `generalExplanation` must name the contrast, because feedback shows only the concept explanation.
6. Distractors must be plausible options from the same content area, not obviously wrong answers.
7. Balance correct-answer positions across A–D; options are always shown in key order.
8. Use AWS exam phrasing where natural: "MOST cost-effective", "LEAST operational overhead", "highly available".
9. Check every question against current AWS documentation and the in-scope service list. Do not use out-of-scope services (for example AWS Snow Family, AWS Wavelength, AWS IQ, AWS CodeDeploy, AWS CloudShell) as correct answers.
10. Questions must be original. Never copy exam dumps.

### Commonly confused groups

Good candidates for comparison questions and for checking that explanations name the contrast:

- Elasticity / scalability / high availability / fault tolerance
- Fixed vs variable costs (CapEx vs OpEx)
- Region / Availability Zone / edge location
- The six Well-Architected pillars
- AWS CAF perspectives; the 7 migration strategies
- CloudWatch / CloudTrail / AWS Config
- GuardDuty / Inspector / Macie / Detective / Security Hub
- Shield / WAF / Firewall Manager
- Security groups vs network ACLs
- IAM users / IAM roles / IAM Identity Center / Cognito
- KMS / CloudHSM / ACM; Secrets Manager vs Parameter Store
- S3 / EBS / EFS / instance store; S3 storage classes
- RDS / Aurora / DynamoDB / ElastiCache / Redshift
- EC2 / Lambda / Fargate / ECS / EKS; Elastic Beanstalk vs CloudFormation
- CloudFront vs Global Accelerator; VPN vs Direct Connect
- SNS / SQS / EventBridge
- On-Demand / Reserved Instances / Savings Plans / Spot; Dedicated Hosts vs Dedicated Instances
- Budgets / Cost Explorer / Pricing Calculator / Cost and Usage Report
- Support plans; Trusted Advisor vs Health Dashboard

### Notable content gaps

- All 90 planned CLF-C02 concepts and lessons are seeded, with 415 active questions. A CLF-C02 mock exam targets 65 questions and can now sample all four domains by exam weight.
- Every seeded CLF-C02 concept has at least 4 questions.
- No CLF-C02 lesson is weak (see [Lesson status](#lesson-status)).
- No ARCHITECTURE questions yet. The exam guide lists designing cloud architecture as out of scope, so that is expected.
- The seeded support-plan questions use Basic Support, AWS Business Support+, AWS Enterprise Support, and AWS Unified Operations. Developer Support, Business Support, and Enterprise On-Ramp remain transitional legacy plans through January 1, 2027.

### Engine constraints affecting content

- An active concept without a lesson returns 404 in Learn, and the stage map and progress table link to every active concept.
- Concepts without active questions are skipped by Practice and Mock but still count towards campaign mastery.
- Mastery requires at least 3 distinct questions answered on at least 2 dates, with the last 3 attempts correct and the latest confidence MEDIUM or HIGH.
- Within a concept, the lowest unseen question code is served first.
- Feedback shows the concept's `generalExplanation` and `keyNote`; there is no per-question explanation.
- Practice shows the concept name above each question.
- Options are shown in key order and are not shuffled.
- Mock exams currently take the first questions of each domain in concept and code order, so every mock contains the same questions. Fixing this is outside the content work.
