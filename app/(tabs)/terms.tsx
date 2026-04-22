import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/constants/Colors';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-8">
      <Text className="text-white text-xl font-bold mb-3">{title}</Text>
      {children}
    </View>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <Text className="text-soft-sky/80 text-base leading-7 mb-4">{children}</Text>;
}

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const isDesktop = Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 768;

  return (
    <View className="flex-1 bg-navy-deep relative overflow-hidden">
      <LinearGradient
        colors={[palette.deepNavy, palette.oceanBlue]}
        className="absolute w-full h-full opacity-30"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: isDesktop ? 60 : Math.max(insets.top + 20, 40),
          paddingBottom: isDesktop ? 60 : insets.bottom + 120,
          paddingHorizontal: 24,
          alignItems: 'center',
        }}
      >
        <View className="w-full max-w-3xl bg-navy-light/80 p-8 rounded-3xl backdrop-blur-md border border-ocean/20">
          <Text style={{ fontFamily: 'Pacifico' }} className="text-4xl text-white mb-2 text-center">
            Terms & Conditions
          </Text>
          <Text className="text-soft-sky/50 text-sm text-center mb-8">Last updated: 2026</Text>

          <Section title="Modifications and Amendments">
            <Para>
              These Terms and Conditions of Use ("Terms and Conditions") are effective and binding by and between EasyListening.com ("EL"), and YOU, as of the moment you start using the EL site. If YOU wish to customize any of the terms below, EL may be able to accommodate your request if EL deems such customization beneficial to both YOU and EL. To request changes, please contact us at Contact@EasyListening.com.
            </Para>
          </Section>

          <Section title="The Site">
            <Para>
              EL shall operate and allow you to access its worldwide internet website located at www.EasyListening.com (the "Site"), for the purpose(s) of providing or downloading music for streaming, broadcasting and podcasting via the worldwide web (the Internet), FM, AM, Satellite, and any other Radio Stations, including those not yet invented and/or developed.
            </Para>
          </Section>

          <Section title="1. Proprietary Rights">
            <Para>
              You acknowledge and agree that EL owns and shall continue to own the copyright in the Site, which is intended for your personal, noncommercial use. All materials published on the Site are protected by copyright and owned and controlled by EL, or the party credited as the content provider. You agree that you will abide by all additional copyright notices, information, or restrictions and refrain from storing, copying, publishing, transmitting, selling, reproducing, modifying or in any way exploiting the underlying code, content, or other elements of the Site in whole or in part.
            </Para>
            <Para>
              Further, you acknowledge and agree that EL's compilation of Artists, to indicate the popularity of respective artists and their music, is of a news reporting nature and therefore EL's use of images, names, music, etc. falls under the protection of the Fair Use Doctrine of Section 107 of the US Copyright Act.
            </Para>
            <Para>
              The Site contains content ("Third Party Content") created by third-parties ("Third Parties"). Third Party Content which includes any text, photo, graphic, audio and/or video material shall not be published, broadcast, rewritten for broadcast or publication or redistributed directly or indirectly in any medium, unless expressly agreed to by EL in writing.
            </Para>
          </Section>

          <Section title="2. Rights of Publicity and Privacy">
            <Para>
              You shall not use the Site in a manner that infringes upon the rights of publicity or privacy, or is in any way defamatory, of any person or entity. You shall not post material that is knowingly false, abusive, vulgar, hateful, harassing, inaccurate, obscene, profane, sexually oriented, threatening, or otherwise in violation of any law. EL reserves the rights to remove any material it deems in violation of this condition.
            </Para>
          </Section>

          <Section title="3. Submissions">
            <Para>
              A. Grant of Rights — You agree that any submission to the Site by you of any music composition, sound recording, performance or other information ("Materials"), constitutes a perpetual, royalty free, non-exclusive grant and license to EL to display, use, modify, copy, reproduce and distribute all such Materials in any media, mode, format, or technology existing now or created in the future.
            </Para>
            <Para>
              B. Indemnification — You agree that your submission constitutes your indemnification of EL. You indemnify, defend and hold EL harmless for any claim, loss, liability and/or damage(s) stemming from the use or distribution of the Materials.
            </Para>
            <Para>
              C. Content Warranty — You warrant, represent, and agree that no materials of any kind submitted through your account infringe, plagiarize, or violate the rights of any third party, including specifically: copyrights, trademarks, privacy or other personal or proprietary rights.
            </Para>
            <Para>
              D. Waiver — You expressly waive all rights in having the Materials altered or changed in a manner not agreeable to you since your submissions to the Site may be edited, removed, published, modified, sent or displayed by EL at its sole discretion.
            </Para>
          </Section>

          <Section title="Username / Password">
            <Para>
              If EL requires a username and password for your account on the Site, you are responsible for maintaining the confidentiality of the password and account, and are fully responsible for all activities that occur under your password or account. EL expressly disclaims any liability for any loss or damage arising from unauthorized use of your username and/or password.
            </Para>
          </Section>

          <Section title="Fees">
            <Para>
              Access to and use of the Site is currently free of charge. EL reserves the right to charge a fee for access to or use of the Site at any time in the future; however, in no event will you be charged for access to the Site unless we obtain your prior agreement to pay such charges.
            </Para>
          </Section>

          <Section title="User Content">
            <Para>
              Certain Site services may allow you to upload, transmit and share content you provide ("Your Content") with third parties. EL takes no responsibility and assumes no liability for any of Your Content. You understand and agree that any loss or damage of any kind that occurs as a result of the use of any of Your Content is solely your responsibility.
            </Para>
            <Para>
              EL collects e-mail addresses and other information of those who communicate with us via e-mail, phone, or other method, aggregate information on what pages individuals or businesses access or visit, information volunteered by individuals or businesses, such as survey information and/or site registrations and/or signup. The information we collect is used to improve the content of our Web Site, and may be used to contact individuals and businesses for marketing purposes or may be used by third party use.
            </Para>
          </Section>

          <Section title="Disclaimers">
            <Para>
              THE EL SITE, SERVICES AND MATERIALS ARE PROVIDED "AS IS", WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND. THE EL PARTIES MAKE NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, ANY AND ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, COMPATIBILITY, SECURITY, ACCURACY, AND NON-INFRINGEMENT.
            </Para>
          </Section>

          <Section title="Limitations on Liability">
            <Para>
              TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW, IN NO EVENT WILL THE EL PARTIES BE LIABLE FOR ANY DAMAGES OR LOSSES, INCLUDING, WITHOUT LIMITATION, DIRECT, INDIRECT, CONSEQUENTIAL, SPECIAL, INCIDENTAL OR PUNITIVE DAMAGES, RESULTING FROM OR CAUSED BY THE SITE OR ITS CONTENT. IN ANY EVENT, ANY LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO THE SERVICE IN THE 12 MONTHS PRIOR TO THE CLAIMED INJURY OR DAMAGE.
            </Para>
          </Section>

          <Section title="Miscellaneous">
            <Para>
              A. Choice of Law and Forum — You agree that these Terms and Conditions shall be construed and interpreted pursuant to the Laws of the State of California. You agree that all matters relating to your access to or use of the Site shall be brought in the Federal District Court, Central District of California, or the Superior Court of the State of California, County of Los Angeles.
            </Para>
            <Para>
              B. Modifications and Amendments — EL may modify these Terms and Conditions at any time. Your continued use of the site, after notice of any modification or amendment, shall constitute acceptance of these Terms and Conditions as so modified or amended.
            </Para>
            <Para>
              C. Geographic Limitations — Although the Site may be accessible worldwide, all features, products, or services provided or offered thereon may not be available to all persons or in all geographic locations, or appropriate or available outside of the United States.
            </Para>
            <Para>
              E. Entire Agreement — These Terms and Conditions constitute the entire agreement between you and EL with regard to your use of the Site.
            </Para>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}
