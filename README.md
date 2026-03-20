# AP Research: OSS Success Analysis on GitHub

## Key Insights at a Glance

- 📊 **221,000+ GitHub repositories**
- 💬 **3,000,000+ comments processed**
- 📁 **105,000+ OSS repositories studied**
- 🧪 **8,000 repositories used for sentiment analysis**
- ⚙️ Data collected using the **official GitHub API at scale**

### Surprising Results

- **Positive communities do NOT make projects more popular**
  - Correlation between sentiment and stars is effectively zero

- **Using a popular programming language does NOT increase success**
  - No meaningful relationship between language popularity and star count

- ⚖️ **Comments are overwhelmingly positive**
  - Average sentiment skews positive across OSS communities


This repository contains the full data collection and analysis pipeline used for the AP Research paper:

**"Exploring the Impact of Community Sentiment and Programming Language Popularity on Open Source Software Success"**

---

## Overview

This project investigates what drives the success of open-source software (OSS) on GitHub.

Two primary factors are analyzed:

1. **Community sentiment** (via GitHub comments)
2. **Programming language popularity**

Success is defined using **GitHub star count**, a widely accepted proxy for repository popularity.

---

## Key Findings

- **Sentiment has no practical impact on success**
  - Weak negative correlations:
    - Positive sentiment vs stars: `r ≈ -0.0557`
      <img width="789" height="278" alt="Screenshot 2026-03-20 at 18 05 32" src="https://github.com/user-attachments/assets/bb15b11b-93e4-4dc2-8ac1-91963f7ca64e" />
    - Negative sentiment vs stars: `r ≈ -0.03`
      <img width="788" height="280" alt="Screenshot 2026-03-20 at 18 05 48" src="https://github.com/user-attachments/assets/8798e627-57ee-4e5d-8476-08de2d3a4420" />
  - Statistically significant but not meaningful in practice

- **Programming language popularity does not drive success**
  - Correlation: `r ≈ -0.00012`

    <img width="541" height="395" alt="Screenshot 2026-03-20 at 18 06 35" src="https://github.com/user-attachments/assets/12c1a1f5-e41a-4bf2-8a1c-caf838e2074f" />
  - No statistically significant relationship

- **Comments are generally positive**
  - <img width="521" height="171" alt="Screenshot 2026-03-20 at 18 03 40" src="https://github.com/user-attachments/assets/b755f71b-c091-4458-93d0-c2bbf712e9db" />
  - Avg positive: ~1.39
    <img width="797" height="318" alt="Screenshot 2026-03-20 at 17 59 56" src="https://github.com/user-attachments/assets/a53bc3f9-08e8-489a-9401-5bc091f72866" />
  - Avg negative: ~-1.23
    <img width="798" height="333" alt="Screenshot 2026-03-20 at 18 00 10" src="https://github.com/user-attachments/assets/d11b982b-5c0a-4c6e-93c3-281bfb02a37e" />

- **Conclusion**
  - Neither sentiment nor language popularity explains OSS success

---

## Other Graphs and Tables

Average Stars per Programming Language on GitHub. Apr. 2025
<img width="570" height="402" alt="Screenshot 2026-03-20 at 18 07 17" src="https://github.com/user-attachments/assets/a66ee41b-6e07-4313-9567-61c18d5e6eba" />

Programming Language Popularity and GitHub Statistics Comparison. Apr. 2025
<img width="725" height="264" alt="Screenshot 2026-03-20 at 18 08 04" src="https://github.com/user-attachments/assets/b9da8a32-6df5-4883-84a3-d179e6db8718" />

---

## Dataset

### Repository Data
- **221,672 repositories collected**
- Filtered to **~105,000 OSS repositories**
- Criteria:
  - ≥ 200 stars
  - Topic-based filtering to remove non-OSS (e.g. "awesome lists")

### Comment Data
- **13,000 repositories sampled**
- **8,055 repositories used**
- **~3.3 million comments collected**
- **~3.05 million human comments analyzed**

---

## Methodology

### 1. Repository Collection (`src/repos.js`)
- Uses GitHub Search API
- Avoids API limits via **star-range partitioning**
- Collects:
  - Name, description, stars, forks
  - Language, topics, metadata

### 2. Filtering
- Removes non-OSS repositories via topic blacklist
- Filters to English repositories using Unicode regex detection

### 3. Comment Collection (`src/comments.js`)
- Randomly samples repositories
- Collects up to **500 comments per repo**
- Uses:
  - Full fetch for small repos
  - Random sampling for large repos
- Stores:
  - Comment text, author type, metadata

### 4. Sentiment Analysis
- Tool: **SentiStrength-SE**
- Outputs:
  - Positive score: `1 → 5`
  - Negative score: `-1 → -5`
- Optimized for software engineering text

### 5. Language Popularity
- Source: **Stack Overflow Developer Survey 2024**
- Popularity measured by % of developers using a language


---

## Technical Highlights

- Handles GitHub API limits (1000-result cap) via **range queries**
- Efficient large-scale scraping (~221k repos in ~4 hours)
- Comment sampling strategy ensures statistical validity
- Processes millions of comments with batching

---

## Limitations

- Sentiment analysis is lexicon-based (not context-aware)
- Topic filtering may exclude some valid OSS projects
- Language detection is heuristic (regex-based)
- Focus limited to GitHub (no GitLab/Bitbucket)

---

## Implications

- Developers should **not rely on sentiment optimization** to grow projects
- Choosing a popular language **does not guarantee success**
- Other factors (not studied here) likely dominate:
  - Utility
  - Marketing
  - Network effects
  - Timing

---

## Reproducibility

To reproduce the data:

1. Create a GitHub personal access token
2. Add to `.env`:
   GITHUB_TOKEN=your_token_here
4. Run scripts:
```bash
node src/repos.js
node src/comments.js

