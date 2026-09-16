from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from docx.enum.section import WD_ORIENT


OUTPUT = "/Users/ujjwalmathur/Desktop/More/X-tool/research/AXE_Pricing_Research.docx"


SOURCES = [
    ("Axe Product Direction", "Internal product record", "September 10 2026", "PRODUCT_DIRECTION.md", "Current scope, audience, workflow, usage limits and positioning"),
    ("I built Tweet Hunters MVP in 2 weeks 4 months later it grew to 150k ARR", "Tibo on Indie Hackers", "October 5 2021", "https://www.indiehackers.com/post/i-built-tweet-hunters-mvp-in-2-weeks-4-months-later-it-grew-to-150k-arr-ama-a6ae1ee850", "Tweet Hunter product evolution, historical 29 and 49 dollar prices, daily engagement advice"),
    ("Raised prices", "Tom Jacquesson on Indie Hackers", "July 5 2021", "https://www.indiehackers.com/product/tweet-hunter/raised-prices--MdqJvUt0PyO7XpIeOvQ", "Tweet Hunter price increase from 9 to 14 dollars and founder report of increased acquisition"),
    ("Tweet Hunter pricing", "Tweet Hunter", "Accessed September 14 2026", "https://tweethunter.io/pricing", "Current Discover, Grow and Enterprise prices and features"),
    ("Typefully pricing", "Typefully", "Accessed September 14 2026", "https://typefully.com/pricing", "Current free, Creator and Business prices and feature limits"),
    ("Hypefury features and pricing", "Hypefury", "Accessed September 14 2026", "https://hypefury.com/features-pricing", "Current prices, watched-user engagement feature and current lack of X support"),
    ("Postwise pricing", "Postwise", "Accessed September 14 2026", "https://postwise.ai/pricing", "Current Basic, Boss and Unlimited prices"),
    ("Replying on X was eating too much time", "Founder Sohan on Indie Hackers", "July 18 2026", "https://www.indiehackers.com/post/replying-on-x-was-eating-too-much-time-PNTxJhC1tvFU3RQNflA6", "XReply offer, free credits, 15 dollar prepaid pack and community discussion"),
    ("ReplyGuy pricing", "Appendment", "Accessed September 14 2026", "https://replyguy.appendment.com/pricing", "Reply-focused free and paid subscription tiers"),
    ("Reply Pilot", "Reply Pilot", "Accessed September 14 2026", "https://www.replypilot.io/", "Reply-focused monthly and annual prices"),
    ("Reply Guy", "Reply Guy", "Accessed September 14 2026", "https://www.replyguy.online/", "Targeted reply workflow and prepaid boost packs"),
    ("ClimbX", "ClimbX", "Accessed September 14 2026", "https://climbx.so/", "Engage feed, creator workflow, founding and regular prices, carded trial"),
    ("1k MRR in 50 days", "ClimbX founder on Reddit", "July 2026", "https://www.reddit.com/r/saasbuild/comments/1upyg66/1k_mrr_in_50_days_the_whole_growth_channel_was_me/", "Self-reported founding customer count, trial conversion and API cost"),
    ("I built a tool to fix my own X posting problem", "OpenTweet founder on Reddit", "February 12 2026", "https://www.reddit.com/r/SideProject/comments/1r2f64j/i_built_a_tool_to_fix_my_own_x_posting_problem_3/", "5.99 dollar creator-tool price and competitor comparison"),
    ("6 Figure Business Baby", "Yannick Veys on Indie Hackers", "August 27 2020", "https://www.indiehackers.com/product/hypefury/6-figure-business-baby--MFiozLmAczqGXWL2btG", "Habit formation, more than 10 percent churn and product-usage learning"),
    ("Flying past 23K MRR in 2 years", "Ayush Chaturvedi on Indie Hackers", "September 2021", "https://www.indiehackers.com/post/flying-past-23k-mrr-in-2-years-hypefury-45f73f0c0a", "Hypefury history and reported MRR jump after a price increase"),
    ("I raised my prices by 70 percent and it was a huge mistake", "Anthony Castrio on Indie Hackers", "October 23 2023", "https://www.indiehackers.com/post/i-raised-my-prices-by-70-it-was-a-huge-mistake-adc87e3fa5", "Price elasticity, monthly-plan removal and PPP experience"),
    ("Raised prices by 5x", "Jon Yongfook on Indie Hackers", "November 12 2019", "https://www.indiehackers.com/product/bannerbear/raised-prices-by-5x--LtUBwZ9wheYw-xuMG5k", "Arguments for higher prices and community objections about opportunity cost"),
    ("Why we went with prepaid credits instead of subscriptions", "Ozan Dagdeviren on Indie Hackers", "June 8 2026", "https://www.indiehackers.com/post/why-we-went-with-prepaid-credits-instead-of-subscriptions-and-what-it-broke-5ec4361590", "Credits for bursty use and their forecasting and hoarding drawbacks"),
    ("Asking for credit cards upfront changed my business", "Ryan Doyle and Indie Hackers commenters", "February 7 2022", "https://www.indiehackers.com/post/asking-for-credit-cards-upfront-changed-my-business-ec400440da", "Carded versus cardless trial evidence and Ghost conversion data"),
    ("Why are Indian users so reluctant to pay for SaaS", "Reddit Indian Startups discussion", "July 5 2026", "https://www.reddit.com/r/indianstartups/comments/1uoaegp/why_are_indian_users_so_reluctant_to_pay_for_saas/", "Anecdotal Indian-market payment, value and subscription observations"),
    ("About X Premium", "X Help Center", "Accessed September 14 2026", "https://help.x.com/en/using-x/x-premium", "India price of X Premium"),
    ("TwitterAPI pricing", "twitterapi.io", "Accessed September 14 2026", "https://twitterapi.io/pricing", "Tweet and profile retrieval costs"),
    ("GPT 5.6 Terra model", "OpenAI Developers", "Accessed September 14 2026", "https://developers.openai.com/api/docs/models/gpt-5.6-terra", "Current input and output token prices"),
    ("X automation development rules", "X Help Center", "Accessed September 14 2026", "https://help.x.com/en/rules-and-policies/x-automation", "Approval requirement for automated AI reply bots"),
]


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=110, start=110, bottom=110, end=110):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color="D9D9D9", size="5"):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = borders.find(qn(f"w:{edge}"))
        if el is None:
            el = OxmlElement(f"w:{edge}")
            borders.append(el)
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), size)
        el.set(qn("w:color"), color)


def add_hyperlink(paragraph, text, url, color="1F4E79", underline=True):
    part = paragraph.part
    r_id = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), r_id)
    new_run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    c = OxmlElement("w:color")
    c.set(qn("w:val"), color)
    r_pr.append(c)
    if underline:
        u = OxmlElement("w:u")
        u.set(qn("w:val"), "single")
        r_pr.append(u)
    new_run.append(r_pr)
    t = OxmlElement("w:t")
    t.text = text
    new_run.append(t)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def add_citation(paragraph, number):
    r = paragraph.add_run(f"[{number}]")
    r.font.superscript = True
    r.font.size = Pt(8)
    r.font.color.rgb = RGBColor(31, 78, 121)


def add_body(doc, text, citations=None, bold_lead=None):
    p = doc.add_paragraph(style="Body Text")
    if bold_lead:
        p.add_run(bold_lead).bold = True
    p.add_run(text)
    for c in citations or []:
        add_citation(p, c)
    return p


def add_bullet(doc, text, citations=None, level=0):
    p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
    p.add_run(text)
    for c in citations or []:
        add_citation(p, c)
    return p


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def make_table(doc, headers, rows, widths=None, font_size=8.5):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        set_cell_shading(cell, "1F2937")
        set_cell_margins(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(font_size)
    for ri, row in enumerate(rows):
        cells = table.add_row().cells
        if ri % 2:
            for c in cells:
                set_cell_shading(c, "F4F7FA")
        for i, value in enumerate(row):
            cell = cells[i]
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(str(value))
            r.font.size = Pt(font_size)
    if widths:
        for row in table.rows:
            for i, width in enumerate(widths):
                row.cells[i].width = Inches(width)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instr, end])


doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(0.72)
section.bottom_margin = Inches(1.25)
section.left_margin = Inches(0.78)
section.right_margin = Inches(0.78)
section.footer_distance = Inches(0.32)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Aptos"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
normal.font.size = Pt(10.8)
normal.font.color.rgb = RGBColor(25, 25, 25)

title_style = styles["Title"]
title_style.font.name = "Aptos Display"
title_style._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
title_style._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
title_style.font.size = Pt(30)
title_style.font.bold = True
title_style.font.color.rgb = RGBColor(0, 0, 0)
title_style.paragraph_format.space_after = Pt(20)
title_ppr = title_style.element.get_or_add_pPr()
title_border = title_ppr.find(qn("w:pBdr"))
if title_border is not None:
    title_ppr.remove(title_border)

for name, size, before, after in (("Heading 1", 19, 18, 9), ("Heading 2", 13, 13, 6), ("Heading 3", 11, 9, 4)):
    st = styles[name]
    st.font.name = "Aptos Display"
    st._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    st._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = RGBColor(0, 0, 0)
    st.paragraph_format.space_before = Pt(before)
    st.paragraph_format.space_after = Pt(after)
    st.paragraph_format.keep_with_next = True

body = styles["Body Text"]
body.font.name = "Aptos"
body._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
body._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
body.font.size = Pt(10.8)
body.paragraph_format.line_spacing = 1.14
body.paragraph_format.space_after = Pt(7)

for list_name in ("List Bullet", "List Bullet 2"):
    st = styles[list_name]
    st.font.name = "Aptos"
    st.font.size = Pt(10.5)
    st.paragraph_format.space_after = Pt(4)
    st.paragraph_format.line_spacing = 1.08

footer = section.footer
fp = footer.paragraphs[0]
fp.add_run("AXE Pricing Research  •  ").font.size = Pt(8)
add_page_number(fp)

# Cover
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(52)
r = p.add_run("AXE")
r.bold = True
r.font.size = Pt(12)
r.font.color.rgb = RGBColor(31, 78, 121)

doc.add_paragraph("AXE Pricing Research", style="Title")
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(18)
r = p.add_run("Pricing evidence from creator tools Indie Hackers discussions and current unit economics")
r.font.size = Pt(15)
r.font.color.rgb = RGBColor(75, 75, 75)

add_body(doc, "AXE should launch as a single paid plan at 9.99 dollars per month internationally and 699 rupees per month in India. The quarterly plan should be 24.99 dollars or 1,799 rupees, an effective discount of about 16 to 17 percent. The existing 19.99 dollar quarterly option discounts the product by one third and leaves too little room for a daily data and AI workflow.")
add_body(doc, "The closest reply-focused products charge 7 to 19 dollars per month at their entry or core tiers. Broader X growth suites charge 29 to 49 dollars per month, while Typefully now offers a mature creator plan for 99 dollars per year. AXE belongs between lightweight reply generation and a full growth suite because it finds the conversations as well as suggesting ways into them.")
add_body(doc, "This recommendation is a launch price, not a permanent truth. AXE has no first-hand willingness-to-pay data yet. The first objective is to learn whether users complete the daily workflow often enough to retain. Price should be tested after that behavior is visible.")

doc.add_paragraph("Recommended launch offer", style="Heading 2")
make_table(doc, ["Market", "Monthly", "Quarterly", "Trial"], [
    ["India", "₹699", "₹1,799", "7 days or 5 complete refreshes without a card"],
    ["International", "$9.99", "$24.99", "7 days or 5 complete refreshes without a card"],
], [1.2, 1.2, 1.3, 3.2], 9.2)

doc.add_page_break()
doc.add_paragraph("Decision Summary", style="Heading 1")

add_body(doc, "AXE is an assisted participation product. It monitors selected creators, ranks recent original posts, and gives the user a small set of useful directions for replies. The user still decides what to say and writes the final response. The product is designed for a short daily ritual, not occasional batch work.", [1])

add_body(doc, "That positioning supports a subscription. A prepaid credit model fits bursty work, but AXE is explicitly trying to create repeated daily use. Indie Hackers experience with credits also shows the downside: uneven revenue, users hoarding credits and unclear churn signals.", [19])

add_body(doc, "The most relevant market band is 7 to 19 dollars per month. Reply Pilot charges 7 dollars for 300 replies and 15 dollars for 1,000. ReplyGuy charges 19 dollars for 300 replies. XReply sells 5,000 credits for 15 dollars without a subscription. AXE can justify the middle of this range because it removes both discovery friction and blank-page friction.", [8, 9, 10])

add_body(doc, "AXE is not ready for the 29 to 49 dollar suite band. Tweet Hunter and ClimbX include scheduling, analytics, content libraries, multiple accounts, AI writing and other growth functions. Their prices reflect wider jobs and, in ClimbX's case, a reported API cost of 13 to 15 dollars per active user each month.", [4, 12, 13])

add_body(doc, "The current 9.99 dollar monthly price is defensible. The current 19.99 dollar quarterly price is not. It lowers effective monthly revenue to 6.66 dollars, while the implementation permits three refreshes a day and fetches up to 100 tweets for each of five tracked creators. At moderate to heavy usage, that discount can erase the contribution margin.", [1, 23, 24])

doc.add_paragraph("The launch decision", style="Heading 2")
add_bullet(doc, "Use one plan. The product is too early for artificial Basic and Pro feature gates.")
add_bullet(doc, "List prices in local currency. Charge ₹699 monthly and ₹1,799 quarterly in India; charge $9.99 monthly and $24.99 quarterly elsewhere.")
add_bullet(doc, "Give a cardless seven-day trial or five complete discovery refreshes, whichever comes first. The trial must show several daily cycles, not one impressive screen.")
add_bullet(doc, "Do not offer a lifetime deal. AXE carries recurring data and model costs and needs recurring revenue.")
add_bullet(doc, "Do not promise unlimited use. Keep the existing bounded workflow and instrument cost per refresh.")
add_bullet(doc, "Review price only after at least 25 paying users and four full weekly cohorts.")

doc.add_page_break()
doc.add_paragraph("Product and Buyer Definition", style="Heading 1")

doc.add_paragraph("The job AXE performs", style="Heading 2")
add_body(doc, "AXE reduces the effort required to participate meaningfully on X. A user selects public accounts to track. AXE retrieves recent original posts, ranks them by traction and recency, and returns a combined feed of reply opportunities. Each opportunity can include concise thinking directions, but AXE does not automatically publish and is not meant to replace the user's judgment.", [1])

add_body(doc, "The current repository allows up to five tracked creators on the pricing page, three refreshes per day and up to 20 returned opportunities. The customer-facing promise can still be framed as five strong daily opportunities. That promise is easier to understand and creates a clear success condition without forcing the product to fill a quota with weak material.", [1])

doc.add_paragraph("The primary buyer", style="Heading 2")
add_body(doc, "The primary buyer is a solo creator, indie founder or small operator who believes X matters for distribution but does not maintain a consistent reply habit. This buyer is motivated by audience growth, relationships or inbound opportunities, but usually cannot attribute a specific amount of revenue to every reply. That makes AXE closer to a prosumer productivity product than a conventional sales tool.")

add_body(doc, "This distinction controls willingness to pay. A business that can connect engagement to lead generation may accept a much higher price. Small creators compare AXE with X Premium, Typefully, ChatGPT and doing the work manually. X Premium itself costs ₹650 per month in India, which makes it a useful local budget anchor.", [22])

doc.add_paragraph("What the buyer is buying", style="Heading 2")
make_table(doc, ["Customer problem", "AXE mechanism", "Observable result"], [
    ["The feed is noisy", "Tracks selected creators and filters recent original posts", "Less time searching"],
    ["The best moment passes", "Ranks by recency and traction", "Earlier entry into active conversations"],
    ["The reply box feels blank", "Shows rough directions and examples", "Faster movement from reading to writing"],
    ["Consistency collapses", "Provides a repeatable daily queue", "More days with meaningful participation"],
], [1.65, 2.65, 2.45], 8.6)

add_body(doc, "The price should therefore be attached to the daily completed workflow, not the number of AI words generated. Counting credits would focus the buyer on model consumption. AXE needs the buyer to focus on useful conversations found and replies posted.")

doc.add_page_break()
doc.add_paragraph("Comparable Product Pricing", style="Heading 1")

add_body(doc, "The table separates direct reply tools from broader creator suites. Current prices come from official pages where available. Founder posts and community listings are marked as self-reported. Prices can change, and several small products provide limited public evidence of active customers.")

make_table(doc, ["Product", "Closest job", "Current or reported price", "Evidence"], [
    ["Reply Pilot", "Generate contextual replies in the X interface", "$7 for 300 replies; $15 for 1,000; $31 unlimited", "Official page [10]"],
    ["ReplyGuy", "Generate replies in the user's style", "Free 10 replies; $19 for 300; $49 for 500; $99 for 1,000", "Official page [9]"],
    ["XReply", "Generate a reply in the user's voice", "200 free credits; $15 for 5,000 prepaid credits", "Indie Hackers launch [8]"],
    ["Reply Guy", "Find targeted people and present one reply opportunity at a time", "$4.99, $29.99 and $45 prepaid boost packs", "Official page [11]"],
    ["OpenTweet", "AI writing, scheduling and integrations for one creator", "$5.99 monthly", "Founder report [14]"],
    ["Typefully", "Writing, scheduling, analytics and AI across text networks", "Free; Creator $99 per year; Business $18 per social set monthly when annual", "Official page [5]"],
    ["Hypefury", "Scheduling, inspiration, analytics and watched-user engagement", "$6 one channel; $19 all channels; currently says X is unsupported", "Official page [6]"],
    ["Tweet Hunter", "X content library, engagement, scheduling, analytics, AI and CRM", "$29 Discover; $49 Grow; $199 Enterprise", "Official page [4]"],
    ["ClimbX", "Ideas, engage feed, AI co-writing, scheduling and analytics", "$29 founding; $39 regular", "Official page [12]"],
    ["Postwise", "AI post writing and scheduling across X, LinkedIn and Threads", "$37 Basic; $59 Boss; $97 Unlimited", "Official page [7]"],
], [1.05, 2.15, 2.35, 1.2], 7.7)

doc.add_page_break()
doc.add_paragraph("What the table says", style="Heading 2")
add_body(doc, "First, reply generation alone is already inexpensive. A new product cannot defend 29 dollars merely because it uses AI. The direct tools make 7 to 19 dollars the normal entry band.")
add_body(doc, "Second, discovery has value. Reply Guy and ClimbX both emphasize finding the right conversations, not only drafting text. AXE's ranking and tracked-creator workflow place it above a browser button that rewrites one visible post.", [11, 12])
add_body(doc, "Third, the suite ceiling has moved. Tweet Hunter still supports 29 and 49 dollar plans, but Typefully now offers a broad individual creator plan for 99 dollars per year. AXE should not assume that an older premium benchmark remains the only reference point.", [4, 5])

doc.add_page_break()
doc.add_paragraph("Indie Hackers Pricing Evidence", style="Heading 1")

doc.add_paragraph("Tweet Hunter shows that price can rise with proof", style="Heading 2")
add_body(doc, "Tweet Hunter reported moving from 9 dollars to 14 dollars in July 2021 and gaining more customers after the change. Three months later, its founder disclosed 29 dollars for inspiration and scheduling and 49 dollars for the AI tier while reporting 150,000 dollars in annual recurring revenue. The company now lists 29 and 49 dollars again for its two main self-serve tiers.", [2, 3, 4])
add_body(doc, "This sequence does not prove that higher prices create demand. It shows that a focused product can begin cheaply, earn credibility, broaden the product and then support a higher price. AXE is still at the first stage.")

doc.add_paragraph("Hypefury shows that habit matters more than feature count", style="Heading 2")
add_body(doc, "Hypefury reported churn above 10 percent while serving almost 600 customers. The founders attributed part of the problem to users failing to maintain the consistent work required for X growth, then added reminders and weekly feedback to support the habit. A later Indie Hackers account reported that a price increase coincided with MRR moving from 13,000 to 19,000 dollars.", [15, 16])
add_body(doc, "The useful lesson for AXE is behavioral. A daily creator product loses customers when the user stops doing the underlying work. Raising price cannot repair a workflow that people do not repeat.")

doc.add_paragraph("The community evidence rejects a universal charge more rule", style="Heading 2")
add_body(doc, "Bannerbear's founder argued that sub-10-dollar customers were difficult to support and raised the lowest tier to 49 dollars. The same discussion included a strong objection: buyers compare a 99-dollar tool with every other use of the same budget, and a narrow, easy-to-copy product may need a lower price to stay credible.", [18])
add_body(doc, "Indie Worldwide later documented the opposite failure. Raising a community membership from 29 to 49 dollars slowed signups and increased churn. Removing monthly billing also failed to increase annual signups. Restoring 29 dollars monthly and adding purchasing-power pricing improved signups, although the author said it was too early to judge churn.", [17])
add_body(doc, "These cases support controlled tests, not founder ideology. Price follows the buyer, the strength of proof, the alternatives and the cost to serve.")

doc.add_paragraph("Credits fit bursty work and subscriptions fit habits", style="Heading 2")
add_body(doc, "XReply uses prepaid credits and a 15-dollar pack, which reduces subscription resistance. An unrelated Indie Hackers case explains why that model can work when demand arrives in bursts, but also reports lumpy revenue and users becoming reluctant to spend credits. AXE is intended for daily use, so subscription pricing is the cleaner fit.", [8, 19])

doc.add_page_break()
doc.add_paragraph("India Market Implications", style="Heading 1")

add_body(doc, "The India evidence is anecdotal and should not be presented as a national willingness-to-pay estimate. The strongest recurring theme in the Indian startup discussion is that buyers rank a software subscription against every other recurring expense. Several commenters favored one-time or annual payments, while others said the real issue was weak or unproven value. One founder reported a 10 to 18 percent conversion rate from a tightly gated free tier, but provided no sample size or product details.", [21])

add_body(doc, "AXE should not respond by racing to ₹99. A daily product that fetches data and runs AI cannot support that price with healthy margins. Very low pricing can also signal that the product is disposable, a concern echoed in both Indie Hackers and Indian founder discussions.", [18, 21])

add_body(doc, "The more useful anchor is X Premium at ₹650 per month in India. AXE at ₹699 asks the buyer to spend roughly another X subscription on a focused growth workflow. That is substantial for a hobbyist but plausible for a creator actively trying to build distribution. ₹499 would lower friction, but it would be difficult to sustain before AXE reduces its current per-refresh cost.", [22])

doc.add_paragraph("Regional pricing structure", style="Heading 2")
make_table(doc, ["Option", "Price", "Reason"], [
    ["India monthly", "₹699", "Close to a familiar X-specific budget anchor and above likely daily variable cost"],
    ["India quarterly", "₹1,799", "About 14 percent cheaper than three monthly payments"],
    ["International monthly", "$9.99", "Within the direct reply-tool band and already implemented"],
    ["International quarterly", "$24.99", "About 17 percent cheaper than three monthly payments"],
], [1.45, 1.15, 4.1], 8.8)

add_body(doc, "A founder offer should be time-bounded rather than permanent. For example, the first 25 paying users could receive ₹599 or $7.99 per month for six months in exchange for structured product feedback. A permanent lifetime price lock transfers unknown future data and model costs to the company and makes later packaging harder.")

doc.add_page_break()
doc.add_paragraph("Unit Economics Stress Test", style="Heading 1")

add_body(doc, "The model below uses the implemented limits, not a generic SaaS margin target. Each refresh can request up to 100 tweets from each of five creators and one profile per creator. twitterapi.io lists 0.15 dollars per 1,000 returned tweets and 0.18 dollars per 1,000 profiles. One full refresh therefore costs up to about 0.0759 dollars for X data.", [1, 23])

add_body(doc, "The AI estimate assumes 5,000 input tokens and 2,000 output tokens for the combined analysis of up to 20 posts. GPT 5.6 Terra costs 2 dollars per million input tokens and 12 dollars per million output tokens. Under this assumption, one refresh costs about 0.034 dollars for AI. Actual cost can differ because tweet length, reasoning tokens and output length vary.", [24])

make_table(doc, ["Average use", "Refreshes monthly", "X data", "AI estimate", "Total variable cost"], [
    ["Once daily", "30", "$2.28", "$1.02", "$3.30"],
    ["Twice daily", "60", "$4.55", "$2.04", "$6.59"],
    ["Three times daily", "90", "$6.83", "$3.06", "$9.89"],
], [1.35, 1.35, 1.05, 1.15, 1.65], 8.8)

doc.add_paragraph("Margin implication", style="Heading 2")
make_table(doc, ["Offer", "Effective monthly revenue", "Margin before fees at one daily refresh", "Margin before fees at two daily refreshes"], [
    ["$9.99 monthly", "$9.99", "67 percent", "34 percent"],
    ["$19.99 quarterly", "$6.66", "50 percent", "About 1 percent"],
    ["$24.99 quarterly", "$8.33", "60 percent", "21 percent"],
], [1.55, 1.6, 1.85, 1.85], 8.3)

add_body(doc, "These are conservative high-return assumptions for data retrieval and illustrative assumptions for AI. They exclude payment fees, taxes, hosting, authentication, support and failed payments. The exercise is still sufficient to show that the current quarterly price is risky.")

doc.add_paragraph("Cost changes with the highest leverage", style="Heading 2")
add_bullet(doc, "Reduce the tweet fetch depth. The product ranks only posts from the last 48 hours and analyzes at most 20 combined candidates, yet it can retrieve 500 tweets per refresh.")
add_bullet(doc, "Cache each creator timeline independently so two users tracking the same creator do not pay for duplicate retrieval inside the freshness window.")
add_bullet(doc, "Record exact model input tokens, output tokens and reasoning tokens for every refresh.")
add_bullet(doc, "Measure cost per completed user day, not only cost per API call.")
add_bullet(doc, "Treat three refreshes as a ceiling. The product promise should center on one useful daily set.")

doc.add_page_break()
doc.add_paragraph("Trial and Billing Design", style="Heading 1")

doc.add_paragraph("A trial should prove the habit", style="Heading 2")
add_body(doc, "A single free result can demonstrate novelty but cannot demonstrate retention. AXE should let a prospect complete the workflow across several days. Seven days or five full refreshes is long enough to show whether the tool repeatedly finds useful conversations and short enough to create a real decision point.")

add_body(doc, "The Indie Hackers evidence on card requirements is mixed. Ghost reported that cardless trials converted at about 2 percent and carded trials at about 25 percent, but total MRR growth did not change because the cardless funnel brought many more signups. A separate founder reported higher revenue after requiring a card. ClimbX reports about 20 percent trial-to-paid conversion with a carded seven-day trial, but it also had an existing X audience and only 35 founding customers.", [13, 20])

add_body(doc, "AXE should begin without a card because the brand is new, the buyer is price-sensitive and the product needs permission to become a habit before charging. A carded trial can be tested later against the same traffic source. The test must compare paid customers per visitor and 30-day retained revenue, not trial conversion alone.")

doc.add_paragraph("What to show before the paywall", style="Heading 2")
add_bullet(doc, "The number of strong opportunities found each day")
add_bullet(doc, "How many opportunities the user opened")
add_bullet(doc, "How many drafts the user copied")
add_bullet(doc, "How many days the user completed the workflow")
add_bullet(doc, "The time between opening AXE and copying a reply draft")

add_body(doc, "Do not claim guaranteed follower growth. AXE can guarantee a bounded product output, such as five strong daily opportunities when enough eligible posts exist, but it cannot guarantee reach, followers or revenue. X requires prior written approval for automated AI reply bots; AXE's human-authored final reply and manual posting design materially lowers that automation risk.", [1, 25])

doc.add_page_break()
doc.add_paragraph("Pricing Experiment", style="Heading 1")

doc.add_paragraph("Phase one founding cohort", style="Heading 2")
add_body(doc, "Recruit 20 to 25 target users directly. Give them the full product for seven days or five complete refreshes. Offer ₹599 or $7.99 monthly for six months only if they complete at least three daily sessions and agree to one short feedback call. This is a research incentive, not the public list price.")

add_body(doc, "The founding cohort should answer whether AXE creates a repeated behavior. It should not be used to estimate broad conversion because recruitment is personal and highly selected.")

doc.add_paragraph("Phase two public price test", style="Heading 2")
make_table(doc, ["Variant", "Monthly", "Quarterly", "What it tests"], [
    ["A", "₹699 or $9.99", "₹1,799 or $24.99", "Recommended baseline"],
    ["B", "₹899 or $12.99", "₹2,299 or $32.99", "Whether stronger price improves revenue without damaging activation"],
], [0.7, 1.45, 1.55, 3.0], 8.8)

add_body(doc, "Run the variants only after traffic is large enough to avoid reacting to a handful of purchases. If volume remains low, use sequential cohorts of at least 25 qualified trial starts rather than pretending a small A B test is statistically decisive.")

doc.add_paragraph("Metrics that decide the winner", style="Heading 2")
make_table(doc, ["Metric", "Definition", "Why it matters"], [
    ["Activated trial", "At least three completed days and at least three copied drafts", "Shows repeated product value"],
    ["Paid conversion", "Paid customers divided by qualified trial starts", "Measures price acceptance after value"],
    ["Day 30 retention", "Customers still active and paid 30 days after conversion", "Separates curiosity from habit"],
    ["Revenue per visitor", "Collected revenue divided by unique qualified landing visitors", "Balances conversion and price"],
    ["Cost per active user day", "Data and AI cost divided by completed user days", "Protects contribution margin"],
    ["Useful opportunity rate", "Opportunities opened or copied divided by opportunities shown", "Measures recommendation quality"],
], [1.35, 2.65, 2.7], 8.3)

add_body(doc, "The higher price wins only if it produces more retained contribution margin, not merely more first-month revenue. If both variants retain poorly, the correct action is to improve the daily workflow rather than lower the price.")

doc.add_paragraph("Final Recommendation", style="Heading 1")

add_body(doc, "Launch AXE with one paid plan at ₹699 per month in India and $9.99 per month elsewhere. Offer quarterly billing at ₹1,799 or $24.99. Keep monthly billing visible and equally easy to select. Use a seven-day or five-refresh cardless trial.")

add_body(doc, "Position the offer around a repeatable daily outcome: AXE finds five strong conversations worth joining and gives the user useful ways into them. Do not position it as unlimited AI writing. The market already treats generic reply generation as a low-cost feature.")

add_body(doc, "Keep the public price below the broad-suite band until AXE proves retention and adds materially broader jobs. If at least 40 percent of new paid users complete three or more days per week after the first month, test ₹899 or $12.99. If retention is weak, do not discount. Fix recommendation quality, trust and the return trigger.")

add_body(doc, "Before scaling acquisition, reduce the amount of X data fetched per refresh or implement shared creator caching. At the current maximum usage, the 9.99 dollar plan can approach zero margin before payment and support costs. The current 19.99 dollar quarterly plan should not launch.")

doc.add_paragraph("Pricing page copy", style="Heading 2")
make_table(doc, ["Element", "Recommended copy"], [
    ["Plan name", "AXE"],
    ["Outcome", "Five strong conversations to join every day"],
    ["Monthly price", "₹699 a month  or  $9.99 a month"],
    ["Quarterly price", "₹1,799 every 3 months  or  $24.99 every 3 months"],
    ["Trial", "Try AXE for 7 days  No card required"],
    ["Core limits", "Track 5 creators  Up to 3 refreshes a day"],
    ["Trust line", "You write and post the final reply"],
], [1.45, 5.25], 9.0)

doc.add_page_break()
doc.add_paragraph("What would change the recommendation", style="Heading 2")
add_bullet(doc, "If AXE reliably produces leads or sales for business users, create a separate higher-priced business plan instead of raising the creator plan for everyone.")
add_bullet(doc, "If most users open AXE fewer than four times a month, consider prepaid day passes or credits because the use case has become bursty.")
add_bullet(doc, "If median variable cost exceeds 30 percent of revenue, reduce retrieval depth or raise the price before adding more AI features.")
add_bullet(doc, "If Indian conversion is materially lower after activation, test ₹599 against ₹699. Do not infer willingness to pay from signups that never reached value.")

doc.add_page_break()
doc.add_paragraph("Evidence Limits", style="Heading 1")

add_body(doc, "Official pricing pages establish listed prices, not sales volume, retention or customer satisfaction. Small reply-tool sites can change quickly, and some publish broad performance claims without independent verification. This report uses their prices and feature descriptions but does not treat their testimonials as proof of results.")

add_body(doc, "Indie Hackers and Reddit posts are founder reports and community opinions. They are useful for understanding decisions, objections and observed outcomes, but most do not disclose complete cohorts or experimental controls. Tweet Hunter and Hypefury provide stronger historical evidence because multiple dated milestones and current product pages can be compared.")

add_body(doc, "The unit-economics model uses public provider prices and implementation limits. The AI token counts are an explicit scenario, not measured production usage. AXE should replace those assumptions with logged costs from the first cohort.")

add_body(doc, "No public research can determine AXE's exact willingness to pay. The evidence narrows a credible starting range and identifies the experiment required to make the next decision with first-hand data.")

doc.add_page_break()
doc.add_paragraph("Sources", style="Heading 1")

for i, (title, publisher, date, url, used) in enumerate(SOURCES, start=1):
    p = doc.add_paragraph(style="Body Text")
    p.paragraph_format.first_line_indent = Inches(-0.22)
    p.paragraph_format.left_indent = Inches(0.22)
    p.add_run(f"{i}. ").bold = True
    if url.startswith("http"):
        add_hyperlink(p, title, url)
    else:
        p.add_run(title).italic = True
    p.add_run(f". {publisher}. {date}. {used}.")

doc.core_properties.title = "AXE Pricing Research"
doc.core_properties.subject = "Pricing research for AXE based on creator tools and founder discussions"
doc.core_properties.author = "AXE"
doc.core_properties.keywords = "AXE pricing X creator tools Indie Hackers SaaS"

doc.save(OUTPUT)
print(OUTPUT)
