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
| Concepts | 19 | 90 |
| Lessons | 19 | 90 |
| Active questions | 86 | ~415 |

### Domains

| # | Topic slug | Name | Exam weight | Question file | Concepts (seeded / planned) | Questions (existing / recommended) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `cloud-concepts` | Cloud Concepts | 24% | `questions/cloud-concepts.json` | 18 / 18 | 83 / 83 |
| 2 | `security-compliance` | Security and Compliance | 30% | `questions/security-compliance.json` | 1 / 24 | 3 / 115 |
| 3 | `cloud-technology-services` | Cloud Technology and Services | 34% | `questions/cloud-technology-services.json` | 0 / 36 | 0 / 159 |
| 4 | `billing-pricing-support` | Billing, Pricing, and Support | 12% | `questions/billing-pricing-support.json` | 0 / 12 | 0 / 58 |
| | | **Total** | | | **19 / 90** | **86 / ~415** |

Cloud Concepts is fully seeded in `questions/cloud-concepts.json`, including the original elasticity questions `CCP-ELA-001` through `CCP-ELA-003`. `questions/core.json` still holds the three Shared Responsibility questions until that domain's first content batch, and `core.json` is removed once empty.

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
| 1 | `clf-shared-responsibility` | SRM | Shared Responsibility Model | seeded | weak | 3 | 8 | Scenario, Understanding, Comparison | How responsibility shifts across EC2, RDS, Lambda, S3 |
| 2 | `clf-iam-users-groups-policies` | IAM | IAM Users, Groups, and Policies (least privilege, managed vs custom policies, access reports) | planned | planned | 0 | 7 | Basic, Understanding, Scenario | IAM roles, IAM Identity Center |
| 3 | `clf-iam-roles` | ROL | IAM Roles (including cross-account roles) | planned | planned | 0 | 5 | Scenario, Comparison | IAM users, access keys |
| 4 | `clf-root-user` | ROO | AWS Account Root User | planned | planned | 0 | 5 | Understanding, Scenario | IAM users |
| 5 | `clf-mfa-credentials` | MFA | MFA, Password Policies, and Access Keys | planned | planned | 0 | 4 | Basic, Understanding | Root user, credential storage |
| 6 | `clf-iam-identity-center` | IDC | AWS IAM Identity Center (federation) | planned | planned | 0 | 4 | Scenario, Comparison | Amazon Cognito, IAM users |
| 7 | `clf-cognito` | COG | Amazon Cognito | planned | planned | 0 | 4 | Scenario, Comparison | IAM Identity Center |
| 8 | `clf-multi-account-governance` | GOV | Multi-Account Governance (Organizations SCPs, Control Tower, Service Catalog, RAM) | planned | planned | 0 | 5 | Understanding, Scenario | IAM policies, consolidated billing |
| 9 | `clf-secrets-management` | SMG | Credential Storage (Secrets Manager, Systems Manager Parameter Store) | planned | planned | 0 | 4 | Comparison, Scenario | AWS KMS |
| 10 | `clf-encryption-kms` | KMS | Encryption and Key Management (KMS, CloudHSM, ACM) | planned | planned | 0 | 5 | Understanding, Comparison | Credential storage |
| 11 | `clf-security-groups` | SGR | Security Groups | planned | planned | 0 | 5 | Understanding, Comparison | Network ACLs |
| 12 | `clf-network-acls` | NAC | Network ACLs | planned | planned | 0 | 4 | Understanding, Comparison | Security groups |
| 13 | `clf-shield` | SHD | AWS Shield | planned | planned | 0 | 5 | Basic, Comparison | AWS WAF |
| 14 | `clf-aws-waf` | WAF | AWS WAF and AWS Firewall Manager | planned | planned | 0 | 5 | Basic, Comparison, Scenario | AWS Shield, security groups |
| 15 | `clf-guardduty` | GDY | Amazon GuardDuty | planned | planned | 0 | 5 | Basic, Comparison | Inspector, Detective, Macie |
| 16 | `clf-inspector` | INS | Amazon Inspector | planned | planned | 0 | 4 | Basic, Comparison | GuardDuty |
| 17 | `clf-macie` | MAC | Amazon Macie | planned | planned | 0 | 4 | Basic, Comparison | GuardDuty |
| 18 | `clf-detective` | DET | Amazon Detective | planned | planned | 0 | 4 | Comparison | GuardDuty, Security Hub |
| 19 | `clf-security-hub` | SHB | AWS Security Hub | planned | planned | 0 | 4 | Understanding, Comparison | GuardDuty, Trusted Advisor |
| 20 | `clf-cloudtrail` | CTR | AWS CloudTrail | planned | planned | 0 | 5 | Basic, Comparison, Scenario | CloudWatch, AWS Config |
| 21 | `clf-cloudwatch` | CWT | Amazon CloudWatch | planned | planned | 0 | 5 | Basic, Comparison, Scenario | CloudTrail |
| 22 | `clf-aws-config` | CFG | AWS Config | planned | planned | 0 | 5 | Understanding, Comparison | CloudTrail |
| 23 | `clf-compliance-artifact` | ART | AWS Compliance and AWS Artifact | planned | planned | 0 | 5 | Basic, Scenario | AWS Config, security resources |
| 24 | `clf-security-resources` | SRS | Security Resources and Third-Party Products (Marketplace, Knowledge Center, Security Center, Security Blog) | planned | planned | 0 | 4 | Basic | Technical resources, AWS Marketplace |

#### 3. Cloud Technology and Services (`cloud-technology-services`) — 36 concepts, 159 questions

| # | Slug | Prefix | Name | Status | Lesson | Existing | Recommended | Main styles | Commonly confused with |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `clf-aws-access-methods` | ACC | Ways to Access AWS (Console, CLI, SDKs, APIs) | planned | planned | 0 | 4 | Basic, Comparison | Infrastructure as code |
| 2 | `clf-infrastructure-as-code` | IAC | Infrastructure as Code (AWS CloudFormation) | planned | planned | 0 | 5 | Understanding, Comparison | Elastic Beanstalk, access methods |
| 3 | `clf-deployment-models` | DPM | Cloud Deployment Models (cloud, hybrid, on-premises, Outposts) | planned | planned | 0 | 4 | Comparison, Scenario | Hybrid connectivity |
| 4 | `clf-regions` | REG | AWS Regions | planned | planned | 0 | 5 | Understanding, Scenario | Availability Zones, edge locations |
| 5 | `clf-availability-zones` | AZS | Availability Zones | planned | planned | 0 | 4 | Understanding, Comparison | Regions, high availability |
| 6 | `clf-edge-locations` | EDG | Edge Locations and AWS Global Accelerator | planned | planned | 0 | 4 | Comparison | CloudFront, Regions |
| 7 | `clf-ec2` | EC2 | Amazon EC2 and Instance Types | planned | planned | 0 | 5 | Basic, Understanding, Scenario | Lambda, Lightsail |
| 8 | `clf-auto-scaling` | ASG | Auto Scaling | planned | planned | 0 | 4 | Understanding, Scenario | Elastic Load Balancing, elasticity |
| 9 | `clf-elastic-load-balancing` | ELB | Elastic Load Balancing | planned | planned | 0 | 4 | Understanding, Scenario | Auto Scaling, Route 53 |
| 10 | `clf-lambda` | LAM | AWS Lambda and Serverless APIs (API Gateway) | planned | planned | 0 | 5 | Basic, Comparison, Scenario | EC2, Fargate |
| 11 | `clf-containers` | CON | Containers (ECS, EKS, Fargate, ECR) | planned | planned | 0 | 5 | Comparison, Scenario | Lambda |
| 12 | `clf-managed-compute-options` | MCO | Managed Compute Options (Elastic Beanstalk, Lightsail, Batch) | planned | planned | 0 | 4 | Comparison, Scenario | CloudFormation, EC2 |
| 13 | `clf-rds-aurora` | RDS | Amazon RDS and Amazon Aurora (managed vs EC2-hosted databases) | planned | planned | 0 | 5 | Basic, Comparison, Scenario | DynamoDB |
| 14 | `clf-dynamodb` | DDB | Amazon DynamoDB | planned | planned | 0 | 5 | Comparison, Scenario | RDS |
| 15 | `clf-other-databases` | DBO | Other Purpose-Built Databases (ElastiCache, DocumentDB, Neptune) | planned | planned | 0 | 4 | Basic, Comparison | DynamoDB, RDS |
| 16 | `clf-database-migration` | DMS | Database Migration (AWS DMS, AWS SCT) | planned | planned | 0 | 4 | Scenario | Migration services |
| 17 | `clf-vpc` | VPC | Amazon VPC (subnets, gateways, PrivateLink, Transit Gateway) | planned | planned | 0 | 5 | Understanding, Comparison | Security groups, network ACLs |
| 18 | `clf-route-53` | R53 | Amazon Route 53 | planned | planned | 0 | 4 | Basic, Understanding | CloudFront, Elastic Load Balancing |
| 19 | `clf-cloudfront` | CFR | Amazon CloudFront | planned | planned | 0 | 4 | Basic, Comparison, Scenario | Global Accelerator, S3 |
| 20 | `clf-hybrid-connectivity` | HYB | Hybrid Connectivity (AWS VPN, AWS Direct Connect) | planned | planned | 0 | 5 | Comparison, Scenario | Deployment models |
| 21 | `clf-s3` | S3B | Amazon S3 | planned | planned | 0 | 5 | Basic, Understanding, Scenario | EBS, EFS |
| 22 | `clf-s3-storage-classes` | S3C | Amazon S3 Storage Classes and Lifecycle Policies | planned | planned | 0 | 5 | Comparison, Scenario | AWS Backup |
| 23 | `clf-ebs-instance-store` | EBS | Block Storage (Amazon EBS, Instance Store) | planned | planned | 0 | 5 | Comparison, Scenario | S3, EFS |
| 24 | `clf-efs-fsx` | EFS | File Storage (Amazon EFS, Amazon FSx) | planned | planned | 0 | 4 | Comparison, Scenario | EBS, S3 |
| 25 | `clf-storage-gateway` | SGW | AWS Storage Gateway | planned | planned | 0 | 4 | Scenario | Hybrid connectivity, S3 |
| 26 | `clf-aws-backup` | BKP | AWS Backup and AWS Elastic Disaster Recovery | planned | planned | 0 | 4 | Understanding, Scenario | S3 lifecycle policies |
| 27 | `clf-sagemaker` | SGM | Amazon SageMaker AI | planned | planned | 0 | 4 | Basic, Comparison | AI services |
| 28 | `clf-ai-language-services` | AIL | AI Language and Assistant Services (Comprehend, Lex, Polly, Transcribe, Translate, Amazon Q) | planned | planned | 0 | 5 | Basic, Comparison | SageMaker AI, vision services |
| 29 | `clf-ai-vision-document-services` | AIV | AI Vision and Document Services (Rekognition, Textract) | planned | planned | 0 | 4 | Basic, Comparison | Language services |
| 30 | `clf-analytics-services` | ANA | Analytics Services (Athena, Redshift, EMR, Glue) | planned | planned | 0 | 5 | Basic, Comparison | RDS, streaming services |
| 31 | `clf-streaming-search-bi` | SBI | Streaming, Search, and BI (Kinesis, OpenSearch Service, Quick Sight) | planned | planned | 0 | 4 | Basic, Comparison | Analytics services, SQS |
| 32 | `clf-application-integration` | INT | Application Integration (SNS, SQS, EventBridge, Step Functions) | planned | planned | 0 | 5 | Comparison, Scenario | Kinesis |
| 33 | `clf-systems-manager` | SSM | AWS Systems Manager | planned | planned | 0 | 4 | Understanding, Scenario | Secrets Manager, CloudWatch |
| 34 | `clf-developer-tools` | DEV | Developer Tools (CodeBuild, CodePipeline, X-Ray) | planned | planned | 0 | 4 | Basic | CloudFormation |
| 35 | `clf-end-user-computing` | EUC | End-User Computing (WorkSpaces, AppStream 2.0, WorkSpaces Secure Browser) | planned | planned | 0 | 4 | Basic, Comparison | EC2 |
| 36 | `clf-other-in-scope-services` | OTH | Business, Frontend, and IoT Services (Connect, SES, Amplify, IoT Core) | planned | planned | 0 | 4 | Basic | SNS |

#### 4. Billing, Pricing, and Support (`billing-pricing-support`) — 12 concepts, 58 questions

| # | Slug | Prefix | Name | Status | Lesson | Existing | Recommended | Main styles | Commonly confused with |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `clf-on-demand-spot` | ODS | On-Demand and Spot Instances | planned | planned | 0 | 5 | Comparison, Scenario | Reserved Instances, Savings Plans |
| 2 | `clf-reserved-savings-plans` | RSP | Reserved Instances, Savings Plans, and Capacity Reservations | planned | planned | 0 | 6 | Comparison, Scenario | On-Demand, Spot |
| 3 | `clf-dedicated-hosts-instances` | DED | Dedicated Hosts and Dedicated Instances | planned | planned | 0 | 4 | Comparison, Scenario | Licensing strategies |
| 4 | `clf-data-transfer-costs` | DTC | Data Transfer Costs | planned | planned | 0 | 4 | Understanding, Scenario | CloudFront |
| 5 | `clf-cost-management-tools` | CMT | Cost Management Tools (Budgets, Cost Explorer, Pricing Calculator, Cost and Usage Report) | planned | planned | 0 | 6 | Comparison, Scenario | Trusted Advisor |
| 6 | `clf-consolidated-billing` | CBL | AWS Organizations Consolidated Billing | planned | planned | 0 | 5 | Understanding, Scenario | Multi-account governance |
| 7 | `clf-cost-allocation-tags` | TAG | Cost Allocation Tags | planned | planned | 0 | 4 | Understanding, Scenario | Cost management tools |
| 8 | `clf-support-plans` | SUP | AWS Support Plans | planned | planned | 0 | 6 | Comparison, Scenario | Technical resources |
| 9 | `clf-trusted-advisor` | TAD | AWS Trusted Advisor (including Service Quotas) | planned | planned | 0 | 5 | Basic, Comparison, Scenario | Health Dashboard, Security Hub, Compute Optimizer |
| 10 | `clf-health-dashboard` | HLT | AWS Health Dashboard and AWS Health API | planned | planned | 0 | 4 | Comparison | Trusted Advisor, CloudWatch |
| 11 | `clf-technical-resources` | RES | AWS Technical Resources (documentation, whitepapers, re:Post, Knowledge Center, Prescriptive Guidance, Support Center, Trust and Safety) | planned | planned | 0 | 4 | Basic | Support plans |
| 12 | `clf-partners-marketplace` | APN | AWS Partners, Marketplace, Professional Services, and Solutions Architects | planned | planned | 0 | 5 | Basic, Comparison | Support plans |

Storage pricing tiers (exam task 4.1) are owned by `clf-s3-storage-classes` in domain 3.

### Lesson status

| Status | Meaning |
| --- | --- |
| `complete` | Summary, at least 3 key points, concept `keyNote` and `referenceUrl`, and the explanation covers every angle its questions test, including the contrast for comparison questions. |
| `weak` | Lesson exists but does not yet cover some angle its planned questions need. |
| `missing` | Active concept without a lesson. Learn returns 404 for it, so it must not ship. |
| `planned` | Concept not yet in `concepts.json`. |

Current weak lessons:

- `clf-shared-responsibility`: the explanation and key note only cover EC2, while CCP-SRM-002 is about S3 bucket permissions. Broaden to EC2 vs RDS vs Lambda vs S3 before adding more questions.

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
| `CCP-SRM-001`–`003` | `clf-shared-responsibility` | 3 | `questions/core.json` |

`CCP-ELA-001`, `CCP-ELA-002`, and `CCP-ELA-003` keep their original codes. `CCP-ELA-001` is now `BASIC`. `CCP-ELA-003` compares elasticity with high availability.

Still open on the Shared Responsibility questions:

- `CCP-SRM-001`: implausible distractors (AWS Support, hardware manufacturer).
- `CCP-SRM-002`: implausible distractors (ISP, hardware manufacturer).

Next free codes: `CCP-VAL-008`, `CCP-ECO-006`, `CCP-ELA-006`, `CCP-HAV-006`, `CCP-WAR-006`, `CCP-WOE-005`, `CCP-WSE-005`, `CCP-WRE-005`, `CCP-WPE-005`, `CCP-WCO-005`, `CCP-WSU-005`, `CCP-CAF-006`, `CCP-MIG-006`, `CCP-MGS-006`, `CCP-CPX-006`, `CCP-LIC-005`, `CCP-RSZ-005`, `CCP-AUT-005`, `CCP-SRM-004`. Every other prefix starts at `001`.

Relabelling style or difficulty keeps the same code (spec section 28).

### Distribution targets

| Dimension | Current (86) | Target |
| --- | --- | --- |
| Style | BASIC 18, UNDERSTANDING 24, COMPARISON 19, SCENARIO 25, ARCHITECTURE 0 | BASIC ~25%, UNDERSTANDING ~30%, COMPARISON ~22%, SCENARIO ~23%, ARCHITECTURE 0–2% |
| Difficulty | EASY 33, MEDIUM 42, HARD 11 | EASY ~40%, MEDIUM ~45%, HARD ~15% |
| Type | SINGLE_CHOICE 74, MULTIPLE_CHOICE 12 | MULTIPLE_CHOICE 10–15% |
| Correct-answer position | A 23, B 24, C 25, D 21, E 5 | Roughly 20–30% per letter (informational) |

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

Planned slugs in the tables above become valid once they are added to `concepts.json` together with their lessons.

### JSON structures

Question (`questions/<topic-slug>.json`, an array of these; example only, not seeded):

```json
{
  "code": "CCP-SRM-004",
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

- 71 of 90 planned concepts and their lessons do not exist yet. Domains 3 and 4 have no concepts. The bank is above 65 questions, so a CLF-C02 mock exam targets 65. Those empty domains contribute nothing, and the exam is filled from Cloud Concepts plus the 3 Shared Responsibility questions.
- `clf-shared-responsibility` still has exactly 3 questions, so no unseen question is left for review after mastery attempts. Every Cloud Concepts concept has at least 4.
- One lesson is weak (see [Lesson status](#lesson-status)).
- The SRM questions use implausible distractors.
- No ARCHITECTURE questions yet. The exam guide lists designing cloud architecture as out of scope, so that is expected.
- The AWS Support plan lineup in the current exam guide is Basic Support, AWS Business Support+, AWS Enterprise Support and AWS Unified Operations. Check the AWS Support plans page when writing `clf-support-plans`.

### Engine constraints affecting content

- An active concept without a lesson returns 404 in Learn, and the stage map and progress table link to every active concept.
- Concepts without active questions are skipped by Practice and Mock but still count towards campaign mastery.
- Mastery requires at least 3 distinct questions answered on at least 2 dates, with the last 3 attempts correct and the latest confidence MEDIUM or HIGH.
- Within a concept, the lowest unseen question code is served first.
- Feedback shows the concept's `generalExplanation` and `keyNote`; there is no per-question explanation.
- Practice shows the concept name above each question.
- Options are shown in key order and are not shuffled.
- Mock exams currently take the first questions of each domain in concept and code order, so every mock contains the same questions. Fixing this is outside the content work.
